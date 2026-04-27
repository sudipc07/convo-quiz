const FORM_ENDPOINT = "/api/send-result";
const RESULT_REVEAL_KEY = "hcResultRevealed";
const TEST_RESULT_PARAM = "result";
const MAGNET_RADIUS = 60;
const MAGNET_MAX_PULL = 6;
const MAX_AXIS_SCORE = 5;
const MATRIX_TIMINGS = {
  canvasIn: 300,
  axisDraw: 600,
  labelsIn: 900,
  dotIn: 1200,
  dotMove: 1400,
  dotLand: 2400,
  compactFadeOut: 3960,
  compactIn: 4200,
  headlineIn: 4400,
  connectorIn: 4500,
};
const TYPE_INTERVAL_MS = 42;

const questions = [
  {
    text: "Your 1:1 is in 5 minutes. You've been meaning to bring something up for two weeks. You:",
    axis: "initiative",
    answers: [
      { text: "Open with it. That's why you're here.", high: true },
      { text: "Start with their update and see how it goes.", high: false },
    ],
  },
  {
    text: "Someone on your team got the outcome right but created friction with two other people in the process. You:",
    axis: "initiative",
    answers: [
      { text: "Focus on the outcome. It worked.", high: false },
      { text: "Talk to them about the friction. How they got there matters.", high: true },
    ],
  },
  {
    text: "Mid-conversation, the other person is still nodding but you can tell they've checked out. You:",
    axis: "craft",
    answers: [
      { text: "Keep going. You have points to make.", high: false },
      { text: "Stop and ask what they're thinking.", high: true },
    ],
  },
  {
    text: 'You\'ve just said something difficult. They say "yeah, noted" and moved on fast. You:',
    axis: "craft",
    answers: [
      { text: "Fine. Message received.", high: false },
      { text: "You're not convinced they actually heard it. You'll check in later.", high: true },
    ],
  },
  {
    text: "Someone on your team has been disengaged for three weeks. Still delivering, but something's off. You:",
    axis: "initiative",
    answers: [
      { text: "Everyone has rough patches. You'll give it more time.", high: false },
      { text: "Something's going on. You find a moment to ask.", high: true },
    ],
  },
  {
    text: "Before a hard conversation, your main focus is:",
    axis: "craft",
    answers: [
      { text: "What you need to say.", high: false },
      { text: "How they're likely to hear it.", high: true },
    ],
  },
  {
    text: "The other person starts getting emotional. You:",
    axis: "craft",
    answers: [
      { text: "Acknowledge it and keep going. Stopping makes it bigger.", high: false },
      { text: "Pause. Give them the moment.", high: true },
    ],
  },
  {
    text: "Nothing changed after your last hard conversation. You:",
    axis: "initiative",
    answers: [
      { text: "Go back in. Clearer this time.", high: true },
      { text: "Replay it. Wonder what you missed.", high: false },
    ],
  },
  {
    text: "Mid-conversation you realise one of your examples was wrong. You:",
    axis: "craft",
    answers: [
      { text: "Move on. The overall point still stands.", high: false },
      { text: "Correct yourself out loud. You'd want them to do the same.", high: true },
    ],
  },
  {
    text: "Your best person was dismissive in a meeting. The room noticed. You:",
    axis: "initiative",
    answers: [
      { text: "Leave it. They earn that latitude.", high: false },
      { text: "Mention it. Quietly, later, directly.", high: true },
    ],
  },
];

const archetypes = {
  coach: {
    key: "coach",
    name: "The Coach",
    displayName: "Coach",
    line: "You raise things early and handle them well. Rare. Don't get rusty.",
    connector:
      "Knowing this is the easy part. Keeping the edge is harder. The risk for you isn't avoidance — it's atrophy. Here's how to stay sharp.",
  },
  bulldozer: {
    key: "bulldozer",
    name: "The Bulldozer",
    displayName: "Bulldozer",
    line: "You raise things early. It doesn't always go well.",
    connector:
      "Knowing this is the easy part. Initiative without craft burns trust. You raise things — you don't always land them well. Here's how to keep the courage and lose the collateral damage.",
  },
  thinker: {
    key: "thinker",
    name: "The Thinker",
    displayName: "Thinker",
    line: "You'd handle it well. You keep putting it off.",
    connector:
      "Knowing this is the easy part. The hard part is actually having the conversation, not rehearsing it. The ones you're drafting in your head are the ones that matter most. Here's how to have them.",
  },
  ghost: {
    key: "ghost",
    name: "The Ghost",
    displayName: "Ghost",
    line: "You put it off. And when it happens, it's rough.",
    connector:
      "Knowing this is the easy part. The cost of not raising them is compounding — quietly, in trust, in retention, in your own confidence. Here's how to start.",
  },
};

const state = {
  currentQuestion: 0,
  responses: [],
  scores: {
    initiative: 0,
    craft: 0,
  },
  result: null,
};

const screens = {
  landing: document.querySelector('[data-screen="landing"]'),
  question: document.querySelector('[data-screen="question"]'),
  result: document.querySelector('[data-screen="result"]'),
  thanks: document.querySelector('[data-screen="thanks"]'),
};

const startButton = document.querySelector("#startButton");
const backButton = document.querySelector("#backButton");
const questionShell = document.querySelector(".question-shell");
const questionCount = document.querySelector("#questionCount");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const resultName = document.querySelector("#resultName");
const resultLine = document.querySelector("#resultLine");
const resultConnector = document.querySelector("#resultConnector");
const resultReveal = document.querySelector("#resultReveal");
const resultMatrix = document.querySelector("#resultMatrix");
const nextSteps = document.querySelector("#nextSteps");
const emailForm = document.querySelector("#emailForm");
const emailInput = document.querySelector("#emailInput");
const revealEmailButton = document.querySelector("#revealEmailButton");
const formError = document.querySelector("#formError");
const submitButton = document.querySelector("#submitButton");
const submittedEmail = document.querySelector("#submittedEmail");
const resultCards = document.querySelectorAll(".result-card");
const linkedCards = document.querySelectorAll(".result-card[data-href]");
const magneticButtons = document.querySelectorAll(".primary-button");
let reportState = "idle";
const matrixComponent = new ResultMatrix(resultMatrix);

startButton.addEventListener("click", () => {
  renderQuestion();
  showScreen("question");
});

applyTestResultShortcut();
initMagneticButtons();
initScrollReveals();

linkedCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      return;
    }

    window.open(card.dataset.href, "_blank", "noopener");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    window.open(card.dataset.href, "_blank", "noopener");
  });
});

backButton.addEventListener("click", () => {
  if (state.currentQuestion === 0) {
    return;
  }

  state.currentQuestion -= 1;
  renderQuestion();
  questionShell.classList.remove("is-leaving");
  questionShell.classList.add("is-entering");
  requestAnimationFrame(() => {
    questionShell.classList.remove("is-entering");
  });
});

revealEmailButton.addEventListener("click", () => {
  setReportState("input");
  emailInput.focus();
});

emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormError();

  const email = emailInput.value.trim();
  if (!emailInput.checkValidity() || !state.result) {
    showFormError("Enter a valid work email.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    await submitResult(email, state.result.name, state.scores);
    if (submittedEmail) {
      submittedEmail.textContent = email;
    }
    setReportState("sent");
  } catch (error) {
    showFormError("Something went wrong. Try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send \u2192";
  }
});

function renderQuestion() {
  const question = questions[state.currentQuestion];
  const selectedAnswerIndex = state.responses[state.currentQuestion];
  questionCount.textContent = `Question ${state.currentQuestion + 1} of ${questions.length}`;
  backButton.hidden = state.currentQuestion === 0;
  questionText.textContent = question.text;
  answers.replaceChildren(
    ...question.answers.map((answer, index) => {
      const button = document.createElement("button");
      button.className = selectedAnswerIndex === index ? "answer-button is-selected" : "answer-button";
      button.type = "button";
      button.textContent = answer.text;
      button.addEventListener("click", () => selectAnswer(index));
      return button;
    }),
  );
}

function selectAnswer(answerIndex) {
  const buttons = answers.querySelectorAll(".answer-button");

  buttons.forEach((button) => {
    button.disabled = true;
    button.classList.remove("is-selected");
  });
  buttons[answerIndex].classList.add("is-selected");

  state.responses = state.responses.slice(0, state.currentQuestion);
  state.responses[state.currentQuestion] = answerIndex;
  recalculateScores();

  questionShell.classList.add("is-leaving");

  window.setTimeout(() => {
    state.currentQuestion += 1;

    if (state.currentQuestion < questions.length) {
      renderQuestion();
      questionShell.classList.remove("is-leaving");
      questionShell.classList.add("is-entering");
      requestAnimationFrame(() => {
        questionShell.classList.remove("is-entering");
      });
      return;
    }

    revealResult();
  }, 300);
}

function recalculateScores() {
  state.scores.initiative = 0;
  state.scores.craft = 0;

  state.responses.forEach((answerIndex, questionIndex) => {
    const question = questions[questionIndex];
    const answer = question.answers[answerIndex];

    if (answer?.high) {
      state.scores[question.axis] += 1;
    }
  });
}

function revealResult() {
  const highInitiative = state.scores.initiative >= 3;
  const highCraft = state.scores.craft >= 3;

  if (highInitiative && highCraft) {
    state.result = archetypes.coach;
  } else if (highInitiative && !highCraft) {
    state.result = archetypes.bulldozer;
  } else if (!highInitiative && highCraft) {
    state.result = archetypes.thinker;
  } else {
    state.result = archetypes.ghost;
  }

  renderResultScreen();
}

function renderResultScreen() {
  renderResultHeadline();
  resultLine.textContent = state.result.line;
  resultConnector.textContent = state.result.connector;
  resetReportCard();
  showScreen("result");

  const shouldAnimate =
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
    sessionStorage.getItem(RESULT_REVEAL_KEY) !== "1";
  const resultShell = screens.result.querySelector(".result-shell");

  resultReveal.classList.remove("is-visible");
  resultReveal.classList.remove("is-typing");
  resultConnector.classList.remove("is-visible");
  nextSteps.classList.remove("is-visible");
  matrixComponent.render({
    result: state.result,
    scores: state.scores,
    animate: shouldAnimate,
  });
  resultShell.classList.toggle("is-matrix-reveal", shouldAnimate);
  resultShell.classList.toggle("skip-result-animation", !shouldAnimate);

  if (!shouldAnimate) {
    resultReveal.classList.add("is-visible");
    resultConnector.classList.add("is-visible");
    matrixComponent.showCompact();
    nextSteps.classList.add("is-visible");
    return;
  }

  requestAnimationFrame(() => {
    resultName.textContent = "";
    matrixComponent.play();
    window.setTimeout(() => {
      matrixComponent.hideForCompact();
    }, MATRIX_TIMINGS.compactFadeOut);
    window.setTimeout(() => {
      resultShell.classList.remove("is-matrix-reveal");
      matrixComponent.showCompact();
      matrixComponent.revealCompact();
    }, MATRIX_TIMINGS.compactIn);
    window.setTimeout(() => {
      resultReveal.classList.add("is-visible", "is-typing");
      typeResultHeadline(() => {
        resultReveal.classList.remove("is-typing");
        window.setTimeout(() => {
          nextSteps.classList.add("is-visible");
          sessionStorage.setItem(RESULT_REVEAL_KEY, "1");
        }, 580);
      });
    }, MATRIX_TIMINGS.headlineIn);
    window.setTimeout(() => {
      resultConnector.classList.add("is-visible");
    }, MATRIX_TIMINGS.connectorIn);
  });
}

function getResultHeadline() {
  return `You're a ${state.result.displayName}.`;
}

function renderResultHeadline() {
  resultName.textContent = getResultHeadline();
}

function typeResultHeadline(onComplete) {
  const headline = getResultHeadline();
  let index = 0;
  resultName.textContent = "";

  const timer = window.setInterval(() => {
    index += 1;
    resultName.textContent = headline.slice(0, index);

    if (index >= headline.length) {
      window.clearInterval(timer);
      onComplete?.();
    }
  }, TYPE_INTERVAL_MS);
}

function ResultMatrix(host) {
  const quadrants = [
    { key: "bulldozer", label: "Bulldozer", x: 28, y: 22, className: "matrix-quadrant--bulldozer" },
    { key: "coach", label: "Coach", x: 72, y: 22, className: "matrix-quadrant--coach" },
    { key: "ghost", label: "Ghost", x: 28, y: 78, className: "matrix-quadrant--ghost" },
    { key: "thinker", label: "Thinker", x: 72, y: 78, className: "matrix-quadrant--thinker" },
  ];
  let dotAnimationFrame = null;
  let activeScores = null;
  let dotGroup = null;

  function render({ result, scores, animate }) {
    cancelAnimationFrame(dotAnimationFrame);
    activeScores = scores;
    host.className = `result-matrix ${animate ? "is-ready-to-reveal" : "is-compact"}`;
    host.setAttribute("aria-label", `${result.displayName} result matrix. Initiative ${scores.initiative} of ${MAX_AXIS_SCORE}. Craft ${scores.craft} of ${MAX_AXIS_SCORE}.`);
    host.innerHTML = getMarkup(result);
    dotGroup = host.querySelector(".matrix-dot-group");
    setDotPosition(getOrigin());
  }

  function play() {
    host.classList.add("is-revealing");
    window.setTimeout(animateDot, MATRIX_TIMINGS.dotMove);
    window.setTimeout(() => {
      host.classList.add("is-landed");
    }, MATRIX_TIMINGS.dotLand);
  }

  function hideForCompact() {
    host.classList.add("is-transition-hidden");
  }

  function revealCompact() {
    window.setTimeout(() => {
      host.classList.remove("is-transition-hidden");
    }, 40);
  }

  function showCompact() {
    cancelAnimationFrame(dotAnimationFrame);
    dotAnimationFrame = null;

    host.classList.remove("is-ready-to-reveal", "is-revealing", "is-landed");
    host.classList.add("is-compact");
    setDotPosition(getScorePosition(activeScores));
  }

  function animateDot() {
    const origin = getOrigin();
    const destination = getScorePosition(activeScores);
    const control = {
      x: (origin.x + destination.x) / 2 + (destination.y < origin.y ? -10 : 10),
      y: (origin.y + destination.y) / 2 - (destination.x > origin.x ? 10 : -10),
    };
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / (MATRIX_TIMINGS.dotLand - MATRIX_TIMINGS.dotMove), 1);
      const eased = easeInOutQuad(progress);
      const x = quadraticBezier(origin.x, control.x, destination.x, eased);
      const y = quadraticBezier(origin.y, control.y, destination.y, eased);
      setDotPosition({ x, y });

      if (progress < 1) {
        dotAnimationFrame = requestAnimationFrame(step);
      }
    }

    dotAnimationFrame = requestAnimationFrame(step);
  }

  function getMarkup(result) {
    const quadrantMarkup = quadrants
      .map(
        (quadrant) => `
          <g class="${quadrant.className} ${quadrant.key === result.key ? "is-active" : ""}">
            <text class="matrix-label" x="${quadrant.x}" y="${quadrant.y}">${quadrant.label}</text>
          </g>
        `,
      )
      .join("");

    return `
      <div class="matrix-stage">
        <svg class="matrix" viewBox="0 0 100 100" role="img" aria-hidden="true" focusable="false">
          <rect class="matrix-bg" x="5" y="5" width="90" height="90" rx="4"></rect>
          <rect class="matrix-quadrant matrix-quadrant--ghost ${result.key === "ghost" ? "is-active" : ""}" x="5" y="50" width="45" height="45"></rect>
          <rect class="matrix-quadrant matrix-quadrant--thinker ${result.key === "thinker" ? "is-active" : ""}" x="50" y="50" width="45" height="45"></rect>
          <rect class="matrix-quadrant matrix-quadrant--bulldozer ${result.key === "bulldozer" ? "is-active" : ""}" x="5" y="5" width="45" height="45"></rect>
          <rect class="matrix-quadrant matrix-quadrant--coach ${result.key === "coach" ? "is-active" : ""}" x="50" y="5" width="45" height="45"></rect>
          <line class="matrix-axis-line matrix-axis-line--vertical" x1="50" y1="5" x2="50" y2="95"></line>
          <line class="matrix-axis-line matrix-axis-line--horizontal" x1="5" y1="50" x2="95" y2="50"></line>
          ${quadrantMarkup}
          <g class="matrix-dot-group">
            <circle class="matrix-dot-pulse" cx="0" cy="0" r="7"></circle>
            <circle class="matrix-dot" cx="0" cy="0" r="2.2"></circle>
          </g>
        </svg>
        <p class="matrix-axis-label matrix-axis-label--high-initiative">High initiative</p>
        <p class="matrix-axis-label matrix-axis-label--low-initiative">Low initiative</p>
        <p class="matrix-axis-label matrix-axis-label--low-craft">Low craft</p>
        <p class="matrix-axis-label matrix-axis-label--high-craft">High craft</p>
      </div>
    `;
  }

  function getOrigin() {
    return { x: 50, y: 50 };
  }

  function getScorePosition(scores) {
    const min = 12;
    const max = 88;
    return {
      x: min + (scores.craft / MAX_AXIS_SCORE) * (max - min),
      y: max - (scores.initiative / MAX_AXIS_SCORE) * (max - min),
    };
  }

  function setDotPosition(position) {
    if (!dotGroup) {
      return;
    }

    dotGroup.style.setProperty("--dot-x", `${position.x}px`);
    dotGroup.style.setProperty("--dot-y", `${position.y}px`);
  }

  function easeInOutQuad(value) {
    return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
  }

  function quadraticBezier(start, control, end, progress) {
    return (1 - progress) ** 2 * start + 2 * (1 - progress) * progress * control + progress ** 2 * end;
  }

  return {
    hideForCompact,
    render,
    revealCompact,
    play,
    showCompact,
  };
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    if (screen.classList.contains("is-active")) {
      screen.classList.add("is-exiting");
    }
    screen.classList.remove("is-active");
  });

  screens[name].classList.remove("is-exiting");
  screens[name].classList.add("is-active");

  window.setTimeout(() => {
    Object.values(screens).forEach((screen) => screen.classList.remove("is-exiting"));
  }, 280);
}

async function submitResult(email, archetype, scores) {
  const payload = {
    email,
    archetype,
    initiative_score: scores.initiative,
    craft_score: scores.craft,
  };

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Form submission failed.");
  }
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.add("is-visible");
}

function clearFormError() {
  formError.textContent = "";
  formError.classList.remove("is-visible");
}

function resetReportCard() {
  clearFormError();
  emailForm.reset();
  setReportState("idle");
  submitButton.disabled = false;
  submitButton.textContent = "Send \u2192";
}

function setReportState(nextState) {
  reportState = nextState;
  emailForm.dataset.reportState = reportState;
}

function applyTestResultShortcut() {
  const params = new URLSearchParams(window.location.search);
  const requestedResult = params.get(TEST_RESULT_PARAM)?.toLowerCase();

  if (!requestedResult || !archetypes[requestedResult]) {
    return;
  }

  state.result = archetypes[requestedResult];
  state.scores = getScoresForResult(requestedResult);
  renderResultScreen();
}

function getScoresForResult(resultKey) {
  const scoreMap = {
    coach: { initiative: 5, craft: 5 },
    bulldozer: { initiative: 5, craft: 0 },
    thinker: { initiative: 0, craft: 5 },
    ghost: { initiative: 0, craft: 0 },
  };

  return scoreMap[resultKey];
}

function initMagneticButtons() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const canAnimate = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  if (!canHover || !canAnimate) {
    return;
  }

  magneticButtons.forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      const offsetX = event.clientX - centreX;
      const offsetY = event.clientY - centreY;
      const distance = Math.hypot(offsetX, offsetY);

      if (distance > MAGNET_RADIUS) {
        resetMagnet(button);
        return;
      }

      const pull = Math.min(MAGNET_MAX_PULL, (1 - distance / MAGNET_RADIUS) * MAGNET_MAX_PULL);
      const angle = Math.atan2(offsetY, offsetX);
      button.style.setProperty("--magnet-x", `${Math.cos(angle) * pull}px`);
      button.style.setProperty("--magnet-y", `${Math.sin(angle) * pull}px`);
      button.classList.add("is-magnetized");
    });

    button.addEventListener("mouseleave", () => resetMagnet(button));
  });
}

function initScrollReveals() {
  const canAnimate = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  if (!canAnimate || !("IntersectionObserver" in window)) {
    resultCards.forEach((card) => card.classList.add("is-scroll-visible"));
    return;
  }

  resultCards.forEach((card, index) => {
    card.classList.add("scroll-reveal");
    card.style.setProperty("--reveal-delay", `${Math.min(index * 70, 210)}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-scroll-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    },
  );

  resultCards.forEach((card) => observer.observe(card));
}

function resetMagnet(button) {
  button.classList.remove("is-magnetized");
  button.style.setProperty("--magnet-x", "0px");
  button.style.setProperty("--magnet-y", "0px");
}
