// JavaScript Document
//HTML5 Ad Template JS from DoubleClick by Google

"use strict"

let uclass = {
  exists: function (elem, className) { let p = new RegExp('(^| )' + className + '( |$)'); return (elem.className && elem.className.match(p)); },
  add: function (elem, className) { if (uclass.exists(elem, className)) { return true; } elem.className += ' ' + className; },
  remove: function (elem, className) { let c = elem.className; let p = new RegExp('(^| )' + className + '( |$)'); c = c.replace(p, ' ').replace(/  /g, ' '); elem.className = c; }
};


/* Enabler.loadModule(studio.module.ModuleId.VIDEO, function () {
  studio.video.Reporter.attach('video_1', video1);
}); */

//Function confirm if the creative is visible	
const enablerInitHandler = () => {
  if (Enabler.isVisible()) {
    preloadImages();
  } else {
    Enabler.addEventListener(studio.events.StudioEvent.VISIBLE, preloadImages);
  }
};


let loadedImages = 0;
let imageArray = new Array(
  "dl_loading.gif",
);

// DOM Elements
let container;
let content;
let internalDiv;
let bgExt;
let btnClose;
let scenes;
let timer;
let cta;
let bounds;
let buttons;
let gameCar;

// State
let currentTime = 25;
let introTime = 16;
let interacted = false;
let isVertical = true;
let score = 0;

// Timers
let introTimer = null;
let gameTimer = null;

const preloadImages = (e) => {
  for (let i = 0; i < imageArray.length; i++) {
    let tempImage = new Image();
    tempImage.addEventListener("load", trackProgress, true);
    tempImage.src = imageArray[i];
  }
}

const trackProgress = () => {
  loadedImages++;
  if (loadedImages == imageArray.length) {
    startAd();
  }
}

//Start the creative
const startAd = () => {
  document.querySelector('#loader-container').style.display = "none";
  //document.querySelector('#dc_bgImage').style.backgroundImage = "url(images/background_selection.jpg)";
  //Assign All the elements to the element on the page
  Enabler.setFloatingPixelDimensions(1, 1);

  Enabler.addEventListener(studio.events.StudioEvent.FULLSCREEN_EXPAND_START, expandHandler);
  Enabler.addEventListener(studio.events.StudioEvent.FULLSCREEN_COLLAPSE_START, collapseHandler);
  Enabler.addEventListener(studio.events.StudioEvent.FULLSCREEN_EXPAND_FINISH, expandFinishHandler);
  Enabler.addEventListener(studio.events.StudioEvent.FULLSCREEN_COLLAPSE_FINISH, collapseFinishHandler);
  Enabler.addEventListener(studio.events.StudioEvent.FULLSCREEN_SUPPORT, fullscreenHandler);

  container = document.querySelector('#dc_container');
  content = document.querySelector('#dc_content');

  internalDiv = document.querySelector('#internalDiv');
  bgExt = document.querySelector('#dc_background_exit');
  btnClose = document.querySelector('#dc_btnClose');
  scenes = document.querySelectorAll('.scene');
  timer = document.querySelector('.game_current_time');
  cta = document.querySelector('.cta_wrapper');
  bounds = document.querySelector('#game');
  buttons = document.querySelectorAll('.button_on');
  gameCar = document.querySelector('#car_lines');

  setTimeout(onResize, 200);

  addListeners();
  Enabler.queryFullscreenSupport();
  initAnimations();

  window.onresize = onResize;
  onResize();
};

const onResize = () => {
  internalDiv.style.display = "block";
  internalDiv.style.top = content.offsetHeight / 2 - internalDiv.offsetHeight / 2 + "px";
  internalDiv.style.left = content.offsetWidth / 2 - internalDiv.offsetWidth / 2 + "px";

  checkRotation();
  checkIfTablet();
};

const checkRotation = () => {
  const iDRect = internalDiv.getBoundingClientRect();

  isVertical = iDRect.height > iDRect.width;

  if (iDRect.width < iDRect.height) {
    // vertical
    scenes.forEach(scene => {
      scene.style.width = iDRect.height + 'px';
      scene.style.height = iDRect.width + 'px';

      const ratio = 50 / (iDRect.width / iDRect.height);
      scene.style.transformOrigin = 'center ' + ratio + '%';
    })
  }
}

const checkIfTablet = () => {
  const iDRect = internalDiv.getBoundingClientRect();

  let min = iDRect.width;
  let max = iDRect.height;

  if (min > max) {
    max = iDRect.width;
    min = iDRect.height;
  }

  if (min / max >= 0.65) {
    // Tablet
    internalDiv.className = 'tablet';
  } else {
    internalDiv.className = '';
  }
}

//Add Event Listeners
const addListeners = () => {
  bgExt.addEventListener('touchEnd', clickBG, false);
  bgExt.addEventListener('click', clickBG, false);
  btnClose.addEventListener('touchEnd', clickClose, false);
  btnClose.addEventListener('click', clickClose, false);
  cta.addEventListener('touchEnd', clickCTA, false);
  cta.addEventListener('click', clickCTA, false);

  // Fix scroll on drag
  document.addEventListener('touchmove', preventBehavior, { passive: false });
};

const preventBehavior = (e) => {
  e.preventDefault();
};

const fullscreenHandler = () => {
  Enabler.requestFullscreenExpand();
}
const expandHandler = () => {
  container.style.display = "block";
  Enabler.finishFullscreenExpand();
}
const expandFinishHandler = () => {

}
const collapseHandler = () => {
  container.style.display = "none";
  Enabler.finishFullscreenCollapse();
}
const collapseFinishHandler = () => {

}
//Add exits
const clickBG = () => {
  if (isEnded) {
    Enabler.counter('VolksWagen-Puzzle-ClickBackground');
    Enabler.exit('HTML5_Background_Clickthrough', window.clickThrough);
    Enabler.requestFullscreenCollapse();
  }
};

const clickCTA = () => {
  Enabler.counter('VolksWagen-Puzzle-ClickCTA');
  Enabler.exit('HTML5_CTA_Clickthrough', window.clickThrough);
  Enabler.requestFullscreenCollapse();
};

const clickClose = () => {
  Enabler.counter('VolksWagen-Puzzle-ManualClose');
  Enabler.reportManualClose();
  Enabler.requestFullscreenCollapse();
  Enabler.close();
}

//Wait for the content to load to call the start od the ad
window.onload = () => {
  if (Enabler.isInitialized()) {
    enablerInitHandler();
  } else {
    Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
  }
};

const initAnimations = () => {
  let tl = new TimelineMax();

  initIntroTimer();
  // Check if the timer should init on-load or before user interaction
  initGameTimer();

  initDrag();
}

const initDrag = () => {
  Enabler.counter('VolksWagen-Puzzle-GameStarted');

  Draggable.create(buttons, {
    type: 'x, y',
    bounds: bounds,
    onDragEnd: function (e) {
      if (!interacted) {
        Enabler.counter('VolksWagen-Puzzle-FirstInteraction');
        interacted = true;
      }
      if (checkCollisions(e.target, gameCar)) {
        score++;

        const id = e.target.id.split('_')[1];

        gsap.set('.message', { opacity: 0 });
        gsap.to(e.target, { duration: 0.3, pointerEvents: 'none', opacity: 0 });
        gsap.to([`#carPiece_${id}`, `#message_${id}`], { duration: 0.3, opacity: 1 });

        if (score === 6) {
          gsap.set('#game', { pointerEvents: 'none' });
          gsap.set(['#game_timer'], { opacity: 0 });
          gsap.to(['#carComplete'], { duration: 0.5, opacity: 1 });
          gsap.to('.car_part:not(#carComplete)', { duration: 0.3, delay: 0.3, opacity: 0 });

          gsap.to(['#message_finish'], { duration: 0.5, opacity: 1, delay:3 });
          setTimeout(gameEnd, 2500);
        }
      } else {
        gsap.to(e.target, { duration: 0.3, x: this.startX, y: this.startY })
      }
    }
  });
}

const checkCollisions = (piece, car) => {
  const pieceBox = piece.getBoundingClientRect();
  const carBox = car.getBoundingClientRect();

  return (
    carBox
    && pieceBox.x + pieceBox.width * .25 < carBox.x + carBox.width
    && pieceBox.x + pieceBox.width * .75 > carBox.x
    && pieceBox.y < carBox.y + carBox.height * 0.85
    && pieceBox.height + pieceBox.y > carBox.y
  );
}

const initIntroTimer = () => {
  if (introTimer === null || introTimer === undefined) {
    introTimer = setTimeout(() => {
      if (!interacted) {
        gameEnd();
      }
    }, introTime * 1000);
  }
}

const initGameTimer = () => {
  if (gameTimer === null || gameTimer === undefined) {
    gameTimer = setInterval(() => {
      currentTime--;
      timer.innerHTML = `0:${('0' + currentTime).slice(-2)}`;
      if (currentTime === 0) {
        clearInterval(gameTimer);
        gameEnd();
      }
    }, 1000);
  }
}

const gameEnd = () => {
  clearInterval(gameTimer);
  clearTimeout(introTimer);
  Enabler.counter('VolksWagen-Puzzle-GameEnded');

  const tl = gsap.timeline();
  tl
    .to('#endFrame', { duration: 0.5, pointerEvents: 'all', opacity: 1, delay:3 }, 3)
    .from(['.endFrame_logo', '.endFrame_txt', '.cta'], { stagger: 0.25, duration: 1.25, opacity: 0, y: '-=20' }, '-=0.2')
}

const getAssetUrl = (filename) => {
  if (Enabler.isServingInLiveEnvironment()) {
    return Enabler.getUrl(filename);
  } else {
    return filename;
  }
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}