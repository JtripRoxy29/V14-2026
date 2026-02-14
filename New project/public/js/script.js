/* Replace gif1.gif etc by dropping files into public/assets/gifs */
const GIF_CONFIG = {
  bannerPrimary: "public/assets/gifs/gif1.gif",
  bannerYesState: "public/assets/gifs/gif2.gif",
  letterDecor: "public/assets/gifs/gif3.gif",
  letterInlineLeft: "public/assets/gifs/gif2.gif",
  letterInlineRight: "public/assets/gifs/gif3.gif",
  letterInlineSpanishTop: "public/assets/gifs/gif4.gif",
  letterInlineSpanishBottom: "public/assets/gifs/gif5.gif",
  letterInlineSpanishThird: "public/assets/gifs/gif6.gif"
};

const NO_BUTTON_PROMPTS = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Super super sure?",
  "Think again?",
  "Last chance?",
  "You sure sure sure?",
  "Please pick Yes?",
  "Are you absolutely sure?",
  "Still no?",
  "Pretty please?"
];

(function initApp() {
  setupFloatingHearts();
  setupGifFallbacks();

  if (document.body.classList.contains("screen-one")) {
    initScreenOne();
  }

  if (document.body.classList.contains("screen-two")) {
    initScreenTwo();
  }

  if (document.body.classList.contains("screen-three")) {
    initFinalLetterScreen();
  }
})();

function initScreenOne() {
  const buttonsArea = document.querySelector(".buttons");
  const yesButton = document.getElementById("yes-button");
  const noButton = document.getElementById("no-button");
  const hint = document.getElementById("hint-message");
  const screenOne = document.body;

  if (!buttonsArea || !yesButton || !noButton || !hint) {
    return;
  }

  let noAttempts = 0;
  let yesScale = 1;
  let noScale = 1;
  screenOne.style.setProperty("--yes-scale", "1");

  noButton.textContent = NO_BUTTON_PROMPTS[0];
  placeButtonsAtStart(buttonsArea, yesButton, noButton);

  const dodge = () => {
    noAttempts += 1;
    yesScale = Math.min(6, yesScale * 1.3);
    noScale = Math.max(0.5, noScale - 0.05);

    yesButton.style.setProperty("--yes-scale", yesScale.toFixed(2));
    noButton.style.setProperty("--no-scale", noScale.toFixed(2));
    screenOne.style.setProperty("--yes-scale", yesScale.toFixed(2));
    noButton.textContent = NO_BUTTON_PROMPTS[Math.min(noAttempts, NO_BUTTON_PROMPTS.length - 1)];

    positionNoButton(buttonsArea, noButton, yesButton);

    if (noAttempts >= 10) {
      hint.hidden = false;
      hint.textContent = "Oh so you hate me that much :(";
    }
  };

  noButton.addEventListener("mouseenter", dodge);
  noButton.addEventListener("click", dodge);
  noButton.addEventListener("touchstart", dodge, { passive: true });

  yesButton.addEventListener("click", () => {
    spawnHeartBurst(yesButton.getBoundingClientRect());

    setTimeout(() => {
      window.location.href = "letter.html";
    }, 760);
  });

  window.addEventListener("resize", () => {
    placeButtonsAtStart(buttonsArea, yesButton, noButton);
  });
}

function placeButtonsAtStart(boundsElement, yesButton, noButton) {
  const bounds = boundsElement.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const noRect = noButton.getBoundingClientRect();

  const gap = 16;
  const totalWidth = yesRect.width + gap + noRect.width;
  const startX = Math.max(10, (bounds.width - totalWidth) / 2);
  const y = Math.max(4, (bounds.height - Math.max(yesRect.height, noRect.height)) / 2 - 120);

  yesButton.style.left = `${Math.round(startX)}px`;
  yesButton.style.top = `${Math.round(y)}px`;

  noButton.style.left = `${Math.round(startX + yesRect.width + gap)}px`;
  noButton.style.top = `${Math.round(y)}px`;
}

function positionNoButton(boundsElement, button, yesButton) {
  const containerRect = boundsElement.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();

  const padding = 12;
  const minX = padding;
  const minY = 8;
  const maxX = Math.max(minX, containerRect.width - buttonRect.width - padding);
  const maxY = Math.max(minY, containerRect.height - buttonRect.height - padding);

  let x = randomBetween(minX, maxX);
  let y = randomBetween(minY, maxY);

  for (let i = 0; i < 14; i += 1) {
    const noLeft = containerRect.left + x;
    const noTop = containerRect.top + y;
    const overlapsYes =
      noLeft < yesRect.right + 10 &&
      noLeft + buttonRect.width > yesRect.left - 10 &&
      noTop < yesRect.bottom + 10 &&
      noTop + buttonRect.height > yesRect.top - 10;

    if (!overlapsYes) {
      break;
    }

    x = randomBetween(minX, maxX);
    y = randomBetween(minY, maxY);
  }

  button.style.left = `${Math.round(x)}px`;
  button.style.top = `${Math.round(y)}px`;
}

function initScreenTwo() {
  const centerHeartButton = document.getElementById("to-final-letter");
  if (!centerHeartButton) {
    return;
  }

  centerHeartButton.addEventListener("click", () => {
    spawnHeartBurst(centerHeartButton.getBoundingClientRect(), 24);
    setTimeout(() => {
      window.location.href = "final-letter.html";
    }, 350);
  });
}

function initFinalLetterScreen() {
  const part1 = document.getElementById("letter-part-1");
  const part2 = document.getElementById("letter-part-2");
  const part3 = document.getElementById("letter-part-3");
  const part4 = document.getElementById("letter-part-4");
  const langToggle = document.getElementById("lang-toggle");
  const letterPaper = document.querySelector(".screen-three .letter-paper");
  const restartButton = document.getElementById("restart-button");
  const gifLeft = document.getElementById("letter-gif-left");
  const gifLeftFallback = document.getElementById("letter-gif-left-fallback");
  const gifRight = document.getElementById("letter-gif-right");
  const gifRightFallback = document.getElementById("letter-gif-right-fallback");
  const gifThird = document.getElementById("letter-gif-third");
  const gifThirdFallback = document.getElementById("letter-gif-third-fallback");
  const gifFigureTop = gifLeft ? gifLeft.closest("figure") : null;
  const gifFigureBottom = gifRight ? gifRight.closest("figure") : null;
  const gifFigureThird = document.getElementById("letter-gif-third-figure");

  if (!part1 || !part2 || !part3 || !part4) {
    return;
  }

  const letterChunks = {
    en: [
      "   HAPPY VALENTINE’S DAY MI AMORCITOO ❤️❤️ For starters, I hope to one day be able to celebrate this special day with you in person, and I’ve got so many ideas for everything we could do, from a movie night to skydiving AHSJHASKA and yes, I will force you to jump 🥺❤️. I truly can’t wait for this summer, all the movie nights, dinner dates, and adventures we have ahead of us 🌸.",
      "   Buuut on a serious note, slowly I’ve learned that I want to be happy when you are happy, smile when you smile, laugh when you laugh, and be sad when you are sad, cry when you cry, and simply be there for you through every little moment, no matter what life throws our way and thats what I think love is ❤️. I know we don’t have much time together because we are both usually running around, and the time zone doesn’t make things easier, but I can’t explain the feeling of coming home from a long day and crashing into bed just to smile and become one of the happiest girls in the world, smiling and giggling while looking at your messages.",
      "   It’s been almost four months of me nonstop smiling, and I don’t see myself getting bored of it anytime soon, cutieee. I think that’s part of the beauty of it all though, living your day, keeping busy, and yet still having enough time to reach out to someone on the entire other side of the world. I’m not too good with my words, but with you I feel like I can speak nonstop and you would never judge me, so I’m sorry if I’m rambling on and on, cutieee.",
      "   I hope you know how much you truly mean to me, my sun ☀️, my moon 🌑, and my stars ⭐. This Valentine’s Day, and every day, I just want you to know that my heart is yours, and that you mean so soo much more to me than I could ever put into words. I love you Javi ❤️."
    ],
    es: [
      "   Holaa Mi Vida ❤️, Mi Amor 🩷, Mi Guapo 💙, Mi Lindo 🩵, Mi Amorcito 💜. De verdad quisiera aprender español algún día, cutie, porque siento que en inglés es difícil expresar algunas cosas, pero espero que esta traducción salga bien. Solo quería contarte algunas cosas que amo especialmente de ti y tomarme un momento para apreciarte. He estado pensando mucho en ti, cutie, y sé que casi no tenemos tiempo para hablar, pero eso no impide que mi mente piense en ti cuando me despierto, cuando como, cuando estudio y cuando me duermo. Así que aquí va una pequeña lista de cosas que amo de ti, cutieeeeee.",
      "   Para empezar, amo tu voz. Creo que fue una de las primeras cosas que hizo que me enamorara de ti. Si quieres saber un secreto, cutie, recuerdo haber hablado un poquito contigo el año pasado y también a principios de este año porque Sargario estaba en llamada contigo, y desde la primera vez que te escuché hablar supe que me encantaría escuchar tu voz como lo primero al despertar y lo último antes de dormir. Creo que lo único que podría competir con tu voz es tu risa. No importa qué tan largo haya sido mi día o lo que haya estado haciendo, en cuanto escucho tu risa, veo tu sonrisa y esos ojos cafés tan bellamente encantadores que tienes, no puedo evitar sonreír, y es una sensación de paz y calma, pero al mismo tiempo emocionante y llena de aventura.",
      "   Tambiénnnn, quiero tomarme un momento para apreciarte y la forma en que me hablas, cutie. Sé que llamar es difícil por muchas razones, así que muchas veces solo tenemos mensajes, y para mí siempre ha sido importante cómo alguien me escribe, y déjame decirte que tú lo haces PERFECTOOOO cada vez. Sé que casi siempre escribimos EN LETRAS BIEN GRANDESSSS, pero siento que eso me ayuda a expresar la emoción que me da hablar contigo, y los corazones… nunca pueden ser demasiados, cutieeee ❤️❤️❤️. Quiero que sepas que aprecio todo eso, y solo hace que me enamore más y más de ti, cutieee. Te Amo Muchísimo, Mi Amor ❤️❤️❤️.",
      "   Amo la forma en que cuidas a las personas, amo cómo hablas, amo cómo sonríes, amo cómo cuentas tus chistes. Amo la manera en que piensas, cómo te dedicas a lo que haces y cómo te mantienes constante. Amo lo amable que eres, lo leal, lo comprensivo y responsable que siempre intentas ser. Amo tu paciencia, mi amor, amo cómo te sientes orgulloso de mí y cómo haces tiempo para mí en tu día, cutie. Amo la forma en que amas… y amo la forma en que simplemente eres tú, cutie. TE AMO MUY MUCHISIMO JAVI ❤️❤️❤️"
    ]
  };

  const renderLetter = (lang) => {
    const chunks = letterChunks[lang] || letterChunks.en;
    part1.textContent = chunks[0];
    part2.textContent = chunks[1];
    part3.textContent = chunks[2];
    part4.textContent = chunks[3] || "";
  };

  const applyGifByLang = (lang) => {
    const isSpanish = lang === "es";
    if (gifFigureTop) {
      gifFigureTop.classList.toggle("left", !isSpanish);
      gifFigureTop.classList.toggle("right", isSpanish);
    }
    if (gifFigureBottom) {
      gifFigureBottom.classList.toggle("right", !isSpanish);
      gifFigureBottom.classList.toggle("left", isSpanish);
    }
    if (gifFigureThird) {
      gifFigureThird.hidden = !isSpanish;
      gifFigureThird.classList.add("right");
      gifFigureThird.classList.remove("left");
    }

    if (gifLeft) {
      gifLeft.hidden = false;
      if (gifLeftFallback) gifLeftFallback.hidden = true;
      gifLeft.src = isSpanish ? GIF_CONFIG.letterInlineSpanishTop : GIF_CONFIG.letterInlineLeft;
    }

    if (gifRight) {
      gifRight.hidden = false;
      if (gifRightFallback) gifRightFallback.hidden = true;
      gifRight.src = isSpanish ? GIF_CONFIG.letterInlineSpanishBottom : GIF_CONFIG.letterInlineRight;
    }
    if (gifThird) {
      if (isSpanish) {
        gifThird.hidden = false;
        if (gifThirdFallback) gifThirdFallback.hidden = true;
        gifThird.src = GIF_CONFIG.letterInlineSpanishThird;
      } else {
        gifThird.hidden = true;
        if (gifThirdFallback) gifThirdFallback.hidden = true;
        gifThird.removeAttribute("src");
      }
    }
  };

  renderLetter("en");
  applyGifByLang("en");

  if (gifLeft) {
    gifLeft.addEventListener("error", () => {
      gifLeft.hidden = true;
      if (gifLeftFallback) gifLeftFallback.hidden = false;
    });
  }

  if (gifRight) {
    gifRight.addEventListener("error", () => {
      gifRight.hidden = true;
      if (gifRightFallback) gifRightFallback.hidden = false;
    });
  }
  if (gifThird) {
    gifThird.addEventListener("error", () => {
      gifThird.hidden = true;
      if (gifThirdFallback) gifThirdFallback.hidden = false;
    });
  }

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const isSpanish = !langToggle.classList.contains("is-spanish");
      langToggle.classList.toggle("is-spanish", isSpanish);
      langToggle.setAttribute("aria-pressed", isSpanish ? "true" : "false");
      const lang = isSpanish ? "es" : "en";
      renderLetter(lang);
      applyGifByLang(lang);
      if (letterPaper) {
        letterPaper.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
}

function setupGifFallbacks() {
  const banner = document.getElementById("banner");
  const bannerFallback = document.getElementById("banner-fallback");
  const decor = document.getElementById("decor-gif");
  const decorFallback = document.getElementById("decor-fallback");

  if (banner) {
    banner.src = GIF_CONFIG.bannerPrimary;
    banner.addEventListener("error", () => {
      if (bannerFallback) {
        banner.hidden = true;
        bannerFallback.hidden = false;
      }
    }, { once: true });
  }

  if (decor) {
    decor.src = GIF_CONFIG.letterDecor;
    decor.addEventListener("error", () => {
      if (decorFallback) {
        decor.hidden = true;
        decorFallback.hidden = false;
      }
    }, { once: true });
  }
}

function setupFloatingHearts() {
  const bg = document.getElementById("hearts-bg");
  if (!bg) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxHearts = reducedMotion ? 10 : 36;

  for (let i = 0; i < maxHearts; i += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.bottom = `${-8 - Math.random() * 25}vh`;
    heart.style.setProperty("--size", `${10 + Math.random() * 22}px`);
    heart.style.animationDuration = `${8 + Math.random() * 10}s`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    heart.style.opacity = `${0.35 + Math.random() * 0.45}`;

    if (reducedMotion) {
      heart.style.opacity = "0.3";
      heart.style.transform = "rotate(45deg)";
    }

    bg.appendChild(heart);
  }
}

function spawnHeartBurst(fromRect, count = 14) {
  if (!fromRect) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  const centerX = fromRect.left + fromRect.width / 2;
  const centerY = fromRect.top + fromRect.height / 2;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "burst-heart";
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty("--x", `${randomBetween(-26, 26)}px`);
    particle.style.setProperty("--y", `${randomBetween(-24, 18)}px`);

    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 700);
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
