var image = { src: './Rick-Rothenberg.jpg', title: 'Rick Rothenberg' };
var timerFunction;

$(document).ready(function() 
{
    fetchImage().then(() => {
        var gridSize = $('#levelPanel :radio:checked').val();
        imagePuzzle.startGame(image, gridSize);
    });

    $('#newPhoto').click(function() {
        fetchImage().then(() => {
            var gridSize = $('#levelPanel :radio:checked').val();
            imagePuzzle.startGame(image, gridSize);
        });
    });

    $('#play').click(function() {
        var gridSize = 2;
        fetchImage().then(() => {
            imagePuzzle.startGame(image, gridSize);
        });
    });

    $('#levelPanel :radio').change(function(e) {
        var gridSize = $(this).val();
        imagePuzzle.startGame(image, gridSize);        
    });
});

var imagePuzzle = 
{
    stepCount: 0,
    startTime: new Date().getTime(),
    startGame: function (image, gridSize) 
    {
        this.setImage(image, gridSize);
        $('#playPanel').show();
        //$('#sortable').randomize();
        this.enableSwapping('#sortable li');
        this.stepCount = 0;
        this.startTime = new Date().getTime();
        this.tick();
    },
    tick: function () 
    {
        var now = new Date().getTime();
        var elapsedTime = parseInt((now - imagePuzzle.startTime) / 1000, 10);
        $('#timerPanel').text(elapsedTime);
        timerFunction = setTimeout(imagePuzzle.tick, 1000);
    },
    
    enableSwapping: function (elem) 
    {
        $(elem).draggable({
            snap: '#droppable',
            snapMode: 'outer',
            revert: "invalid",
            helper: "clone"
        });
        $(elem).droppable({
            drop: function (event, ui) 
            {
                var $dragElem = $(ui.draggable).clone().replaceAll(this);
                $(this).replaceAll(ui.draggable);

                currentList = $('#sortable > li').map(function (i, el) { return $(el).attr('data-value'); });
                if (isSorted(currentList))
                    $('#actualImageBox').empty().html($('#gameOver').html());
                else 
                {
                    var now = new Date().getTime();
                    imagePuzzle.stepCount++;
                    $('.stepCount').text(imagePuzzle.stepCount);
                    $('.timeCount').text(parseInt((now - imagePuzzle.startTime) / 1000, 10));
                }

                imagePuzzle.enableSwapping(this);
                imagePuzzle.enableSwapping($dragElem);
            }
        });
    },

    setImage: function (image, gridSize) 
    {
        //console.log(gridSize);
        gridSize = gridSize || 2; // If gridSize is null or not passed, default it as 2.
        //console.log(gridSize);
        var percentage = 100/(gridSize - 1);
        $('#imgTitle').html("Author : "+image.title);
        $('#actualImage').attr('src', image.src);
        $('#sortable').empty();
        for (var i = 0; i < gridSize * gridSize; i++) 
        {
            var xpos = (percentage * (i % gridSize)) + '%';
            var ypos = (percentage * Math.floor(i / gridSize)) + '%';
            var li = $('<li class="item" data-value="' + (i) + '"></li>').css({
                'background-image': 'url(' + image.src + ')',
                'background-size': (gridSize * 100) + '%',
                'background-position': xpos + ' ' + ypos,
                'width': 400 / gridSize,
                'height': 400 / gridSize
            });
            $('#sortable').append(li);
        }
        $('#sortable').randomize();
        currentList = $('#sortable > li').map(function (i, el) { return $(el).attr('data-value'); });
        while(isSorted(currentList))
        {
            this.setImage(image, gridSize);
        }
    }    
};

function isSorted(arr) 
{
    for (var i = 0; i < arr.length - 1; i++) 
    {
        if (arr[i] != i)
            return false;
    }
    return true;
}

$.fn.randomize = function (selector) 
{
    var $elems = selector ? $(this).find(selector) : $(this).children(),
        $parents = $elems.parent();

    $parents.each(function () {
        $(this).children(selector).sort(function () {
            return Math.round(Math.random()) - 0.5;
        }).remove().appendTo(this);
    });
    return this;
};

async function fetchImage() 
{
    try 
    {
        const imageId = Math.floor(Math.random() * 1001);
        const response = await fetch(`https://picsum.photos/id/${imageId}/info`);

        if(!response.ok) {
            throw new Error('Failed to fetch image details');
        }

        const data = await response.json();

        if(data) 
        {
            var new_image = {
                src: `https://picsum.photos/id/${imageId}/400`,
                title: data.author
            };

            image = new_image;
            //console.log(image);
        }
    } 
    catch (error) {
        console.error('Error fetching image details:', error);
    }
}

function rules() {
    alert('Rearrange the pieces so that you get a sample image. \nThe steps taken are counted');
}