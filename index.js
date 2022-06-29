class CanvasPlayground {

    canvas = document.getElementById('canvas');
    ctx = this.canvas.getContext('2d',{ alpha: false });

    panInitPositionX = 0;
    panInitPositionY = 0;

    imgPositionX = 0;
    imgPositionY = 0;

    imageWidth = 4096;
    imageHeight = 1600;

    deltaPositionX;
    deltaPositionY;

    photo = new Image();

    constructor() {
        this.photo.src = './photos/canvasTestPhoto.png';

        this.photo.addEventListener('load', () => {
            this.setCanvasDimensions();
            this.drawImage();
            this.panActivation();
        });

        window.addEventListener('resize', () => {
            this.setCanvasDimensions();
            this.drawImage();
            this.panActivation();
        });

   //     this.boundedPanHandler = this.panHandler.bind(this);
    }

    setCanvasDimensions(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    drawImage = () => {
        this.ctx.fillRect(0, 0, this.imageWidth, this.imageHeight)
        this.ctx.drawImage(this.photo, this.imgPositionX, this.imgPositionY, this.imageWidth, this.imageHeight);
    }

    panHandler = (e) => {
        this.deltaPositionX = e.clientX - this.panInitPositionX;
        this.deltaPositionY = e.clientY - this.panInitPositionY;

        this.imgPositionX += this.deltaPositionX;
        this.imgPositionY += this.deltaPositionY;
        this.drawImage();

        this.imgPositionX -= this.deltaPositionX;
        this.imgPositionY -= this.deltaPositionY;
    }

    panActivation = () => {
        this.canvas.addEventListener('mousedown', (e) => {
            this.panInitPositionX = e.clientX;
            this.panInitPositionY = e.clientY;
            this.canvas.addEventListener('mousemove', this.panHandler);
        });
        this.canvas.addEventListener('mouseup', () => {
            this.canvas.removeEventListener('mousemove',  this.panHandler);
        });
    }

}

new CanvasPlayground();
