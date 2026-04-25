const FORM_ENDPOINT = "";

const questions = [
  {
    text: "Your 1:1 is in 5 minutes. You've been meaning to bring something up for two weeks. You:",
    axis: "initiative",
    answers: [
      { text: "Open with it. That's why you're here.", high: true },
      { text: "Start with their update. See how the conversation goes.", high: false },
    ],
  },
  {
    text: "Someone on your team got the outcome right but the way they did it created friction with two other people. You:",
    axis: "initiative",
    answers: [
      { text: "Focus on the outcome. It worked. Don't fix what isn't broken.", high: false },
      { text: "Talk to them about the friction. The how matters as much as the what.", high: true },
    ],
  },
  {
    text: "Mid-conversation, the other person's eyes go flat. They're still nodding but they've checked out. You:",
    axis: "craft",
    answers: [
      { text: "Keep going. You've got ground to cover.", high: false },
      { text: "Stop. Ask them what they're thinking.", high: true },
    ],
  },
  {
    text: 'You\'ve just delivered difficult feedback. They say "yeah, fair enough" and move on quickly. You:',
    axis: "craft",
    answers: [
      { text: "Good. Clean and done.", high: false },
      { text: "Not sure they actually heard it. You follow up later.", high: true },
    ],
  },
  {
    text: "A team member who usually delivers has been off for three weeks. Not bad enough to escalate. Just... different. You:",
    axis: "initiative",
    answers: [
      { text: "It'll pass. Everyone has patches.", high: false },
      { text: "Something's going on. You find a moment to ask.", high: true },
    ],
  },
  {
    text: "You're about to tell someone their work isn't good enough. Before you speak, you think about:",
    axis: "craft",
    answers: [
      { text: "What you need to say.", high: false },
      { text: "How they're likely to receive it.", high: true },
    ],
  },
  {
    text: "The conversation gets emotional. They're not crying but they're close. You:",
    axis: "craft",
    answers: [
      { text: "Acknowledge it briefly and keep going. Dwelling makes it worse.", high: false },
      { text: "Pause completely. Let them get there and back before you continue.", high: true },
    ],
  },
  {
    text: "Two weeks after a difficult conversation, the behaviour hasn't changed. You:",
    axis: "initiative",
    answers: [
      { text: "Go back in. This time with more clarity on consequences.", high: true },
      { text: "Wonder if you were clear enough the first time.", high: false },
    ],
  },
  {
    text: "You've just realised mid-conversation that you've got the facts wrong. One of your examples isn't accurate. You:",
    axis: "craft",
    answers: [
      { text: "Adjust quietly and keep the overall point alive.", high: false },
      { text: 'Acknowledge it directly. "Actually, I need to correct that."', high: true },
    ],
  },
  {
    text: "Your best performer says something dismissive in a team meeting. Small, but the room noticed. You:",
    axis: "initiative",
    answers: [
      { text: "Let it go. They're your best performer. Pick your battles.", high: false },
      { text: "Mention it to them later. Privately, briefly, directly.", high: true },
    ],
  },
];

const archetypes = {
  coach: {
    name: "The Coach",
    line: "You know when to push and when to hold back.",
  },
  bulldozer: {
    name: "The Bulldozer",
    line: "You start things most managers never would. The question is what happens next.",
  },
  thinker: {
    name: "The Thinker",
    line: "You know exactly what good looks like. You're just not always the one saying it.",
  },
  ghost: {
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
    await submitResult(email, state.result.name);
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
  showScreen("result");
  window.setTimeout(() => emailInput.focus(), 320);
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

async function submitResult(email, archetype) {
  const payload = { email, archetype };

  if (!FORM_ENDPOINT) {
    console.info("Set FORM_ENDPOINT in script.js before launch.", payload);
    return;
  }

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
