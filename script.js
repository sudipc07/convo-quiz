const FORM_ENDPOINT = "/api/send-result";

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
    text: "Someone on your team has been flat for three weeks. Still delivering, but something's off. You:",
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
    line: "You know when to push and when to hold back.",
  },
  bulldozer: {
    key: "bulldozer",
    name: "The Bulldozer",
    line: "You start things most managers never would. The question is what happens next.",
  },
  thinker: {
    key: "thinker",
    name: "The Thinker",
    line: "You know exactly what good looks like. You're just not always the one saying it.",
  },
  ghost: {
    key: "ghost",
    name: "The Ghost",
    line: "The conversations you're avoiding are having themselves - just without you.",
  },
};

const state = {
  currentQuestion: 0,
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
const questionShell = document.querySelector(".question-shell");
const questionCount = document.querySelector("#questionCount");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const resultName = document.querySelector("#resultName");
const resultLine = document.querySelector("#resultLine");
const resultDelayedElements = document.querySelectorAll(".result-delayed");
const matrixDotGroup = document.querySelector("#matrixDotGroup");
const matrixLabels = document.querySelectorAll(".matrix-label");
const matrixQuadrants = document.querySelectorAll(".matrix-quadrant");
const emailForm = document.querySelector("#emailForm");
const emailInput = document.querySelector("#emailInput");
const archetypeInput = document.querySelector("#archetypeInput");
const formError = document.querySelector("#formError");
const submitButton = document.querySelector("#submitButton");
const submittedEmail = document.querySelector("#submittedEmail");

startButton.addEventListener("click", () => {
  renderQuestion();
  showScreen("question");
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
    submittedEmail.textContent = email;
    showScreen("thanks");
  } catch (error) {
    showFormError("Something went wrong. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send my result \u2192";
  }
});

function renderQuestion() {
  const question = questions[state.currentQuestion];
  questionCount.textContent = `Question ${state.currentQuestion + 1} of ${questions.length}`;
  questionText.textContent = question.text;
  answers.replaceChildren(
    ...question.answers.map((answer, index) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.textContent = answer.text;
      button.addEventListener("click", () => selectAnswer(index));
      return button;
    }),
  );
}

function selectAnswer(answerIndex) {
  const question = questions[state.currentQuestion];
  const answer = question.answers[answerIndex];
  const buttons = answers.querySelectorAll(".answer-button");

  buttons.forEach((button) => {
    button.disabled = true;
    button.classList.remove("is-selected");
  });
  buttons[answerIndex].classList.add("is-selected");

  if (answer.high) {
    state.scores[question.axis] += 1;
  }

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

  resultName.textContent = state.result.name;
  resultLine.textContent = state.result.line;
  archetypeInput.value = state.result.name;
  renderMatrix(state.result);
  showScreen("result");
  window.setTimeout(() => {
    resultDelayedElements.forEach((element) => element.classList.add("is-visible"));
  }, 500);
  window.setTimeout(() => emailInput.focus(), 820);
}

function renderMatrix(result) {
  const padding = 24;
  const usableSize = 320 - padding * 2;
  const x = padding + (state.scores.craft / 5) * usableSize;
  const y = 320 - padding - (state.scores.initiative / 5) * usableSize;

  matrixDotGroup.classList.remove("is-animating");
  matrixDotGroup.style.setProperty("--dot-x", `${x}px`);
  matrixDotGroup.style.setProperty("--dot-y", `${y}px`);
  void matrixDotGroup.getBoundingClientRect();
  matrixDotGroup.classList.add("is-animating");

  matrixLabels.forEach((label) => {
    label.classList.toggle("is-active", label.dataset.quadrant === result.key);
  });
  matrixQuadrants.forEach((quadrant) => {
    quadrant.classList.toggle("is-active", quadrant.dataset.quadrant === result.key);
  });
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
