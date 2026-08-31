"use client";

/**
 * État du parcours.
 *
 * Le hook ne connaît ni le barème ni la copy : il enchaîne des écrans et
 * délègue tout le reste au moteur. Retour arrière autorisé, réponses conservées.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { computeResult, pruneAnswers, servedQuestions } from "./engine";
import { buildRecord, EMPTY_LEAD, EMPTY_UTM, readUtm } from "./record";
import { newRecordId, persistRecord, trackEvent } from "./telemetry";
import type {
  Answers,
  DiagnosticResult,
  FlowType,
  LeadFields,
  OptionValue,
  QuestionId,
  Ranking,
  ServedQuestion,
} from "./types";

export type Screen = "intro" | "ranking" | "question" | "result";

export interface DiagnosticState {
  readonly screen: Screen;
  readonly ranking: Ranking;
  readonly answers: Answers;
  readonly questions: readonly ServedQuestion[];
  readonly currentIndex: number;
  readonly current: ServedQuestion | null;
  readonly result: DiagnosticResult | null;
  readonly leadSubmitted: boolean;
  /** Numéro d'écran de question affiché (1-based), pour la barre de progression. */
  readonly step: number;
  readonly totalSteps: number;
  start: () => void;
  toggleFlow: (flow: FlowType) => void;
  submitRanking: () => void;
  answer: (id: QuestionId, value: OptionValue) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
  submitLead: (lead: LeadFields) => void;
  trackCta: () => void;
}

export function useDiagnostic(): DiagnosticState {
  const [screen, setScreen] = useState<Screen>("intro");
  const [ranking, setRanking] = useState<Ranking>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const startedAt = useRef<number | null>(null);
  const recordId = useRef<string | null>(null);
  const utm = useRef(EMPTY_UTM);
  const resultTracked = useRef(false);
  const lastScreenReached = useRef<string>("intro");

  const questions = useMemo(
    () => servedQuestions(ranking, answers),
    [ranking, answers],
  );

  const current = questions[currentIndex] ?? null;

  const result = useMemo(
    () => (screen === "result" ? computeResult(ranking, answers) : null),
    [screen, ranking, answers],
  );

  /* --------------------------------------------------------------------- */
  /* Télémétrie                                                            */
  /* --------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window !== "undefined") {
      utm.current = readUtm(window.location.search);
    }
  }, []);

  // Un abandon avant l'écran de résultat reste une donnée exploitable : le taux
  // d'abandon par question dira quelle question est mal formulée.
  useEffect(() => {
    const onLeave = () => {
      if (resultTracked.current) return;
      trackEvent("abandoned", { last_screen: lastScreenReached.current });
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, []);

  useEffect(() => {
    lastScreenReached.current =
      screen === "question" && current ? current.question.id : screen;
  }, [screen, current]);

  // L'enregistrement est créé dès l'écran de résultat — avant l'email.
  useEffect(() => {
    if (screen !== "result" || !result || resultTracked.current) return;
    resultTracked.current = true;

    recordId.current = recordId.current ?? newRecordId();
    const duration = startedAt.current
      ? Math.round((Date.now() - startedAt.current) / 1000)
      : 0;

    persistRecord(
      buildRecord({
        result,
        answers,
        id: recordId.current,
        createdAt: new Date(),
        durationSeconds: duration,
        lead: EMPTY_LEAD,
        utm: utm.current,
      }),
    );

    trackEvent("result_viewed", {
      branch: result.branch,
      indice: result.indice,
      level: result.level,
      outcome: result.outcome,
      duration_seconds: duration,
    });
  }, [screen, result, answers]);

  /* --------------------------------------------------------------------- */
  /* Actions                                                               */
  /* --------------------------------------------------------------------- */

  const start = useCallback(() => {
    startedAt.current = Date.now();
    trackEvent("diagnostic_started");
    setScreen("ranking");
  }, []);

  /** Un clic classe la carte ; un second la retire et renumérote les suivantes. */
  const toggleFlow = useCallback((flow: FlowType) => {
    setRanking((previous) =>
      previous.includes(flow)
        ? previous.filter((entry) => entry !== flow)
        : [...previous, flow],
    );
  }, []);

  const submitRanking = useCallback(() => {
    if (ranking.length === 0) return;
    // Un changement de classement peut rendre des réponses orphelines.
    setAnswers((previous) => pruneAnswers(ranking, previous));
    setCurrentIndex(0);
    setScreen("question");
    trackEvent("ranking_submitted", { ranking });
  }, [ranking]);

  const answer = useCallback((id: QuestionId, value: OptionValue) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    trackEvent("question_answered", { question_id: id, value });
  }, []);

  const next = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setScreen("result");
      return;
    }
    setCurrentIndex(currentIndex + 1);
  }, [currentIndex, questions.length]);

  const back = useCallback(() => {
    if (screen === "result") {
      setScreen("question");
      setCurrentIndex(Math.max(questions.length - 1, 0));
      return;
    }
    if (screen === "question") {
      if (currentIndex === 0) {
        setScreen("ranking");
        return;
      }
      setCurrentIndex(currentIndex - 1);
      return;
    }
    if (screen === "ranking") setScreen("intro");
  }, [screen, currentIndex, questions.length]);

  const restart = useCallback(() => {
    resultTracked.current = false;
    recordId.current = null;
    startedAt.current = Date.now();
    setRanking([]);
    setAnswers({});
    setCurrentIndex(0);
    setLeadSubmitted(false);
    setScreen("ranking");
  }, []);

  const submitLead = useCallback(
    (lead: LeadFields) => {
      if (!result || !recordId.current) return;
      const duration = startedAt.current
        ? Math.round((Date.now() - startedAt.current) / 1000)
        : 0;

      persistRecord(
        buildRecord({
          result,
          answers,
          id: recordId.current,
          createdAt: new Date(),
          durationSeconds: duration,
          lead,
          utm: utm.current,
        }),
      );

      trackEvent("lead_submitted", {
        branch: result.branch,
        role: lead.role,
        perimetre: lead.perimetre,
        budget: lead.budget,
      });
      setLeadSubmitted(true);
    },
    [result, answers],
  );

  const trackCta = useCallback(() => {
    if (!result) return;
    trackEvent("cta_clicked", { outcome: result.outcome, branch: result.branch });
  }, [result]);

  return {
    screen,
    ranking,
    answers,
    questions,
    currentIndex,
    current,
    result,
    leadSubmitted,
    step: currentIndex + 1,
    totalSteps: questions.length,
    start,
    toggleFlow,
    submitRanking,
    answer,
    next,
    back,
    restart,
    submitLead,
    trackCta,
  };
}
