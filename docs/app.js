const subscriptionForm = document.getElementById("subscriptionForm");
const emailInput = document.getElementById("emailInput") || document.getElementById("email");
const subscribeBtn = document.getElementById("subscribeBtn");
const heroMessage = document.getElementById("heroMessage");
const modal = document.getElementById("questionModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const detailsForm = document.getElementById("detailsForm");
const formMessage = document.getElementById("formMessage");
const formSteps = Array.from(document.querySelectorAll(".form-step"));
const stepLabel = document.getElementById("stepLabel");
const stepDots = Array.from(document.querySelectorAll(".step-dot"));
const backStepBtn2 = document.getElementById("backStepBtn2");
const backStepBtn4 = document.getElementById("backStepBtn4");
const nextStepBtn3 = document.getElementById("nextStepBtn3");
const topicStepLegend = document.getElementById("topicStepLegend");
const topicStepHelp = document.getElementById("topicStepHelp");
const topicSelectionGrid = document.getElementById("topicSelectionGrid");
const topicSelectionCounter = document.getElementById("topicSelectionCounter");
const industrySelect = document.getElementById("industrySelect");
const locationInput = document.getElementById("locationInput");
const roleSelect = document.getElementById("roleSelect");

// const topicOptions = [
//   "Politics",
//   "World",
//   "Business",
//   "Technology",
//   "AI",
//   "Health",
//   "Climate",
//   "Science",
//   "Entertainment",
//   "Culture",
//   "Leadership",
//   "Fashion",
//   "Sports",
//   "Lifestyle",
// ];

const topicOptions =[
  "Politics",
  "Tech & AI",
  "Business & Leadership",
  "Health & Science",
  "Climate & Environment",
  "Culture & Entertainment",
  "Sports"
]

let pendingEmail = "";
let currentStep = 1;
const selectedTopics = new Set();
const onboardingParams = new URLSearchParams(window.location.search);
const prefillEmailFromQuery = onboardingParams.get("email");
const sourceTopicFromQuery = onboardingParams.get("source_topic");
const sourceFromQuery = onboardingParams.get("source");
const returnToFromQuery = onboardingParams.get("return_to");
const isStandaloneOnboardingPage = window.location.pathname.toLowerCase().endsWith("/onboarding.html");
window.ONBOARDING_SOURCE_CONTEXT = {
  source: sourceFromQuery || null,
  sourceTopic: sourceTopicFromQuery || null,
};

if (prefillEmailFromQuery && emailInput) {
  emailInput.value = prefillEmailFromQuery;
  pendingEmail = prefillEmailFromQuery.trim().toLowerCase();
}

const stepTitles = {
  1: "Briefing Type",
  2: "Topic Selection",
  3: "Professional Info",
};

function selectedBriefingType() {
  const input = document.querySelector('input[name="briefingType"]:checked');
  return input ? input.value : "";
}

function selectedTopicPreferences() {
  return Array.from(selectedTopics).map((topic) => ({
    name: topic,
  }));
}

function updateStepUI() {
  formSteps.forEach((stepEl) => {
    const stepNumber = Number(stepEl.dataset.step);
    stepEl.classList.toggle("hidden", stepNumber !== currentStep);
  });

  stepLabel.textContent = `Page ${currentStep} of 3 - ${stepTitles[currentStep]}`;
  stepDots.forEach((dot) => {
    dot.classList.toggle("active", Number(dot.dataset.stepDot) === currentStep);
  });
}

function goToStep(stepNumber) {
  currentStep = stepNumber;
  formMessage.textContent = "";
  updateStepUI();
}

function openModal() {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  goToStep(1);
}

function closeModal() {
  if (isStandaloneOnboardingPage) {
    const safeReturnTo =
      typeof returnToFromQuery === "string" && returnToFromQuery.startsWith("/")
        ? returnToFromQuery
        : "/stories.html";
    window.location.href = safeReturnTo;
    return;
  }
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function updateTopicStepCopy() {
  const briefingType = selectedBriefingType();
  if (briefingType === "general") {
    topicStepLegend.textContent = "Any specific interests?";
    topicStepHelp.textContent = "Optional: select up to 4 topics.";
    return;
  }
  topicStepLegend.textContent = "Choose topics you care about";
  topicStepHelp.textContent = "Select up to 4 topics.";
}

function updateTopicCounters() {
  topicSelectionCounter.textContent = `${selectedTopics.size} of 4 selected`;
  nextStepBtn3.disabled = false;
}


function renderTopicSelectionStep() {
  topicSelectionGrid.innerHTML = "";
  topicOptions.forEach((topic) => {
    const selected = selectedTopics.has(topic);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `topic-chip${selected ? " is-selected" : ""}`;
    button.setAttribute("data-topic", topic);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.innerHTML = `
      <span class="topic-chip-check" aria-hidden="true">✓</span>
      <span class="topic-chip-label">${topic}</span>
    `;
    topicSelectionGrid.appendChild(button);
  });
  updateTopicCounters();
}

topicSelectionGrid.addEventListener("click", (event) => {
  const chip = event.target.closest(".topic-chip");
  if (!chip) {
    return;
  }
  const topic = chip.dataset.topic;
  if (!topic) {
    return;
  }

  if (selectedTopics.has(topic)) {
    selectedTopics.delete(topic);
  } else {
    if (selectedTopics.size >= 4) {
      formMessage.textContent = "You can select up to 4 topics.";
      return;
    }
    selectedTopics.add(topic);
  }

  formMessage.textContent = "";
  renderTopicSelectionStep();
});


document.querySelectorAll('input[name="briefingType"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }
    updateTopicStepCopy();
    goToStep(2);
  });
});

document.addEventListener("click", (event) => {
  const card = event.target.closest(".briefing-option-card");
  if (!card) {
    return;
  }
  const input = card.querySelector("input");
  if (!input) {
    return;
  }

  if (input.name === "briefingType") {
    input.checked = true;
    updateTopicStepCopy();
    goToStep(2);
  }
});

subscriptionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  pendingEmail = emailInput.value.trim();
  heroMessage.classList.remove("success", "error");

  if (!pendingEmail) {
    heroMessage.textContent = "Please enter a valid email address.";
    heroMessage.classList.add("error");
    return;
  }

  try {
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = "Subscribing...";
    heroMessage.textContent = "";
    heroMessage.textContent = "You're in. Let's personalize your TIME newsletters.";
    heroMessage.classList.add("success");
    openModal();
  } catch (error) {
    heroMessage.textContent = error.message;
    heroMessage.classList.add("error");
  } finally {
    subscribeBtn.disabled = false;
    subscribeBtn.textContent = "Subscribe";
  }
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

detailsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const briefingType = selectedBriefingType();
  const topicPreferences = selectedTopicPreferences();
  const location = locationInput.value.trim();
  const industry = industrySelect.value.trim();
  const role = roleSelect.value.trim();
  if (!briefingType) {
    formMessage.textContent = "Please choose a briefing type.";
    return;
  }
  if (topicPreferences.length > 4) {
    formMessage.textContent = "Please select no more than 4 topics.";
    return;
  }
  try {
    formMessage.textContent = "Preferences saved. Welcome to TIME Newsletter.";
    heroMessage.textContent = "You are subscribed. Thank you for joining TIME Newsletter.";
    detailsForm.reset();
    selectedTopics.clear();
    renderTopicSelectionStep();
    emailInput.value = "";
    pendingEmail = "";

    setTimeout(() => {
      closeModal();
      formMessage.textContent = "";
    }, 1100);
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

backStepBtn2.addEventListener("click", () => goToStep(1));
backStepBtn4.addEventListener("click", () => goToStep(2));
nextStepBtn3.addEventListener("click", () => {
  goToStep(3);
});

renderTopicSelectionStep();
updateTopicStepCopy();
updateStepUI();

if (
  prefillEmailFromQuery &&
  isStandaloneOnboardingPage
) {
  openModal();
}
