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
  },
  bulldozer: {
    key: "bulldozer",
    name: "The Bulldozer",
    displayName: "Bulldozer",
    line: "You raise things early. It doesn't always go well.",
  },
  thinker: {
    key: "thinker",
    name: "The Thinker",
    displayName: "Thinker",
    line: "You'd handle it well. You keep putting it off.",
  },
  ghost: {
    key: "ghost",
    name: "The Ghost",
    displayName: "Ghost",
    line: "You put it off. And when it happens, it's rough.",
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
const resultReveal = document.querySelector("#resultReveal");
const nextSteps = document.querySelector("#nextSteps");
const emailForm = document.querySelector("#emailForm");
const emailInput = document.querySelector("#emailInput");
const emailInline = document.querySelector("#emailInline");
const revealEmailButton = document.querySelector("#revealEmailButton");
const formError = document.querySelector("#formError");
const submitButton = document.querySelector("#submitButton");
const reportCardContent = document.querySelector("#reportCardContent");
const reportCardSuccess = document.querySelector("#reportCardSuccess");
const submittedEmail = document.querySelector("#submittedEmail");
const linkedCards = document.querySelectorAll(".result-card[data-href]");

startButton.addEventListener("click", () => {
  renderQuestion();
  showScreen("question");
});

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
  emailInline.hidden = false;
  revealEmailButton.hidden = true;
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
    reportCardContent.hidden = true;
    reportCardSuccess.hidden = false;
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

  resultName.textContent = `You're a ${state.result.displayName}.`;
  resultLine.textContent = state.result.line;
  resetReportCard();
  showScreen("result");
  requestAnimationFrame(() => {
    resultReveal.classList.add("is-visible");
    nextSteps.classList.add("is-visible");
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

function resetReportCard() {
  clearFormError();
  emailForm.reset();
  emailInline.hidden = true;
  revealEmailButton.hidden = false;
  reportCardContent.hidden = false;
  reportCardSuccess.hidden = true;
  submitButton.disabled = false;
  submitButton.textContent = "Send \u2192";
}
