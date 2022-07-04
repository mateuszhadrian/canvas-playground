class CanvasPlayground {

    canvas = document.getElementById('canvas');
    ctx = this.canvas.getContext('2d', {alpha: false});
    isDragging = false;
    zoomFactor = 1;
    cursorCoordinates;

    position = {
        x: 0,
        y: 0,
    }

    dragStart = {
        x: 0,
        y: 0
    };

    imageWidth = 4096;
    imageHeight = 1600;

    drawImageNumber

    photo = new Image();

    constructor() {
        this.photo.src = './photos/canvasTestPhoto.png';

        this.photo.addEventListener('load', () => {
            this.drawImage();
            this.panActivation();
            this.zoomActivation()
        });

        window.addEventListener('resize', () => {
            this.drawImage();
            this.panActivation();
            this.zoomActivation()
        });

    }

    setCanvasDimensions() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    drawImage = () => {
        this.setCanvasDimensions();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const scale = this.canvas.height / this.imageHeight;
        this.imageWidth = scale * this.imageWidth * this.zoomFactor;
        this.imageHeight = scale * this.imageHeight * this.zoomFactor;
        this.drawImageNumber = Math.ceil(this.canvas.width / this.imageHeight) + 1;
        for (let i=1; i<=this.drawImageNumber; i++){
            this.ctx.drawImage(this.photo, this.position.x + this.imageWidth * i - this.imageWidth, this.position.y, this.imageWidth, this.imageHeight);
            this.ctx.drawImage(this.photo, this.position.x - this.imageWidth * i + this.imageWidth, this.position.y, this.imageWidth, this.imageHeight);
        }


    }

    getEventLocation = (e) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    }

    onPanStart = (e) => {
        this.isDragging = true;
        this.dragStart = {
            x: this.getEventLocation(e).x - this.position.x,
            y: this.getEventLocation(e).y - this.position.y
        }
    };

    onPanStop = () => {
        this.isDragging = false;
    }

    updatePosition = (position) => {
        let canvasHigherThanImage = this.canvas.height > this.imageHeight;
        let minPositionY = - (this.imageHeight - this.canvas.height);
        let maxPositionY = 0
        if (canvasHigherThanImage){
            position.y = (this.canvas.height - this.imageHeight)/2
        } else {
            if (position.y < minPositionY){
                position.y = minPositionY
            }
            if (position.y > maxPositionY){
                position.y = maxPositionY
            }
        }
        this.position = position;
    }

    panHandler = (e) => {
        let position;
        if (this.isDragging) {
            position = {
                x: this.getEventLocation(e).x - this.dragStart.x,
                y: this.getEventLocation(e).y - this.dragStart.y
            };
            this.updatePosition(position);
            this.drawImage();

        }
    }

    zoomHandler = (e) => {
        e.preventDefault();
        this.cursorCoordinates = {x: e.pageX, y: e.pageY}
        const direction = e.deltaY > 0 ? 'in' : 'out';
        if (direction === 'in'){
            this.zoomFactor -= 0.01
        } else {
            this.zoomFactor += 0.01
        }
        this.updatePosition(this.position)
        this.drawImage()
    }

    panActivation = () => {
        this.canvas.addEventListener('mousedown', this.onPanStart);
        this.canvas.addEventListener('mousemove', this.panHandler);
        this.canvas.addEventListener('mouseup', this.onPanStop);
    }

    zoomActivation = () => {
        this.canvas.addEventListener('wheel', this.zoomHandler)
    }

}

new CanvasPlayground();
