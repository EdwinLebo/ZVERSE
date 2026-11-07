import { useEffect, useState } from 'react'
import { ArrowRight, Check, RotateCcw, Trophy, X } from 'lucide-react'
import { Badge, ExhibitHeading } from '../components/UI'
import { questions } from '../data/learning'

const storeKey = 'zverse-quiz-v1'
const sets = { all: questions, beginner: questions.filter(question => question[0] === 'beginner'), technical: questions.filter(question => question[0] === 'technical') }
const newRun = () => ({ index: 0, answers: [], finished: false })

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey))
    const mode = Object.hasOwn(sets, saved?.mode) ? saved.mode : 'all'
    const runs = Object.fromEntries(Object.entries(sets).map(([key, set]) => {
      const run = saved?.runs?.[key]
      const valid = Array.isArray(run?.answers) && run.answers.length <= set.length &&
        run.answers.every(answer => Number.isInteger(answer) && answer >= 0 && answer <= 2) &&
        Number.isInteger(run.index) && run.index >= 0 && run.index < set.length &&
        run.answers.length >= run.index && run.answers.length <= run.index + 1 &&
        (!run.finished || run.answers.length === set.length)
      return [key, valid ? run : newRun()]
    }))
    return { mode, runs }
  } catch {
    return { mode: 'all', runs: { all: newRun(), beginner: newRun(), technical: newRun() } }
  }
}

export default function Quiz() {
  const [state, setState] = useState(restore)
  const { mode, runs } = state
  const run = runs[mode]
  const set = sets[mode]
  const [, prompt, answers, correct, feedback] = set[run.index]
  const selected = run.answers[run.index]
  const score = run.answers.reduce((total, answer, index) => total + Number(answer === set[index][3]), 0)

  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(state)) } catch { /* The current session remains playable. */ }
  }, [state])

  function update(next) {
    setState(previous => ({ ...previous, runs: { ...previous.runs, [mode]: next } }))
  }

  return <div className="shell exhibit-page">
    <ExhibitHeading code="FIELD GUIDE / KNOWLEDGE CHECK" title="Test Your Mainframe Knowledge" description="Choose a level and learn from the explanation after each answer. Progress is saved in this browser." />
    <section className="panel quiz-panel">
      <div className="panel-header"><div className="segmented" aria-label="Quiz difficulty">
        {[['all', 'All levels'], ['beginner', 'Beginner'], ['technical', 'Technical']].map(([key, label]) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => setState(previous => ({ ...previous, mode: key }))}>{label}</button>)}
      </div><button type="button" className="button compact-button secondary" onClick={() => update(newRun())}><RotateCcw size={15} /> Restart quiz</button></div>
      <label className="quiz-progress"><span>{run.answers.length} / {set.length} answered</span><progress max={set.length} value={run.answers.length} /></label>
      {run.finished ? <div className="score" role="status"><Trophy size={38} /><div className="meta">QUIZ COMPLETE</div><h2>{score} / {set.length}</h2>
        <p>{score === set.length ? 'Every answer was correct.' : 'Review the field guide or restart the quiz to practice.'}</p>{score === set.length && <Badge>MAINFRAME EXPLORER</Badge>}
        <a className="button primary" href="#/learn">Back to field guide <ArrowRight size={16} /></a></div> :
        <>
          <div className="meta">QUESTION {String(run.index + 1).padStart(2, '0')}</div><h2>{prompt}</h2>
          <div className="answer-list">{answers.map((answer, index) => <button type="button" key={answer} disabled={selected !== undefined}
            onClick={() => update({ ...run, answers: [...run.answers, index] })}
            className={selected === undefined ? '' : index === correct ? 'answer-correct' : index === selected ? 'answer-wrong' : ''}>
            <span>{String.fromCharCode(65 + index)}</span>{answer}{selected !== undefined && index === correct && <Check size={18} />}{selected === index && selected !== correct && <X size={18} />}
          </button>)}</div>
          {selected !== undefined && <div className="quiz-feedback" role="status"><strong>{selected === correct ? 'Correct' : 'Incorrect'}</strong><p>{feedback}</p></div>}
          <button type="button" className="button primary" disabled={selected === undefined} onClick={() => update(run.index === set.length - 1 ? { ...run, finished: true } : { ...run, index: run.index + 1 })}>
            {run.index === set.length - 1 ? 'See score' : 'Next question'} <ArrowRight size={16} /></button>
        </>}
    </section>
  </div>
}
