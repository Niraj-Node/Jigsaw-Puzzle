class ImagePuzzle {
  constructor() {
    this.step = 0;
    this.startTime = 0;
    this.timerFunction = null;
    this.currentImage = {
      src: "./Rick-Rothenberg.jpg",
      title: "Rick Rothenberg",
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.fetchImageAndStartGame();
  }

  bindEvents() {
    $("#newPhoto").on("click", () => this.fetchImageAndStartGame());
    $("#playMore").on("click", () => this.fetchImageAndStartGame());
    $("#levelPanel :radio").on("change", () =>
      this.startGame(this.currentImage, this.getGridSize())
    );
  }

  async fetchImageAndStartGame() {
    try {
      $("#gameOver").hide();
      $("#actualImageBox").show();
      await this.fetchImage();
      this.startGame(this.currentImage, this.getGridSize());
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  }

  async fetchImage() {
    const imageId = Math.floor(Math.random() * 1001);
    try {
      const response = await fetch(`https://picsum.photos/id/${imageId}/info`);
      if (!response.ok) throw new Error("Failed to fetch image details");

      const data = await response.json();
      this.currentImage = {
        src: `https://picsum.photos/id/${imageId}/400`,
        title: data.author,
      };
    } catch (error) {
      console.error("Error fetching image details:", error);
    }
  }

  startGame(image, gridSize) {
    this.setImage(image, gridSize);
    this.step = 0;
    $("#stepPanel").text(this.step);
    $("#playPanel").show();
    $("#sortable li").removeClass("no-hover");
    this.enableSwapping("#sortable li");
    this.startTime = Date.now();
    this.updateTimer();
  }

  setImage(image, gridSize = 3) {
    const percentage = 100 / (gridSize - 1);
    $("#imgTitle").text(`Author : ${image.title}`);
    $("#actualImage").attr("src", image.src);
    $("#sortable").empty();

    for (let i = 0; i < gridSize * gridSize; i++) {
      const xpos = percentage * (i % gridSize) + "%";
      const ypos = percentage * Math.floor(i / gridSize) + "%";
      const li = $('<li class="item"></li>')
        .attr("data-value", i)
        .css({
          "background-image": `url(${image.src})`,
          "background-size": `${gridSize * 100}%`,
          "background-position": `${xpos} ${ypos}`,
          width: 400 / gridSize,
          height: 400 / gridSize,
        });
      $("#sortable").append(li);
    }

    while (this.isSorted(this.getCurrentListOrder())) {
      $("#sortable").randomize();
    }
  }

  getCurrentListOrder() {
    return $("#sortable > li")
      .map((i, el) => $(el).attr("data-value"))
      .get();
  }

  isSorted(arr) {
    return arr.slice(0, -1).every((val, i) => val == i);
  }

  enableSwapping(elem) {
    $(elem)
      .draggable({
        snap: "#droppable",
        snapMode: "outer",
        revert: "invalid",
        helper: "clone",
      })
      .droppable({
        drop: (event, ui) => this.handleDrop(event, ui),
      });
  }

  handleDrop(event, ui) {
    const $dragElem = $(ui.draggable).clone().replaceAll(event.target);
    $(event.target).replaceAll(ui.draggable);
    this.step++;

    const currentList = this.getCurrentListOrder();
    if (this.isSorted(currentList)) {
      $("#stepCount").text(this.step);
      $("#timerCount").text(this.getElapsedTime());
      this.endGame();
    } else {
      $("#stepPanel").text(this.step);
      $("#timerPanel").text(this.getElapsedTime());
    }

    this.enableSwapping(event.target);
    this.enableSwapping($dragElem);
  }

  getElapsedTime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  endGame() {
    this.stopTimer();
    $("#sortable li").addClass("no-hover");
    $("#actualImageBox").hide();
    $("#gameOver").show();
  }

  updateTimer() {
    this.stopTimer();
    this.timerFunction = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      $("#timerPanel").text(elapsedTime);
    }, 1000);
  }

  stopTimer() {
    if (this.timerFunction) clearInterval(this.timerFunction);
  }

  getGridSize() {
    return $("#levelPanel :radio:checked").val() || 3;
  }
}

// Initialize and run ImagePuzzle
$(document).ready(() => {
  const puzzle = new ImagePuzzle();
});

// Utility function to randomize sortable elements
$.fn.randomize = function (selector) {
  const $elems = selector ? this.find(selector) : this.children();
  $elems.parent().each(() =>
    $(this)
      .children(selector)
      .sort(() => Math.random() - 0.5)
      .detach()
      .appendTo(this)
  );
  return this;
};

// Display game rules
function rules() {
  alert(
    "Rearrange the pieces to match the original image.\nEach move is counted."
  );
}
