class CanvasPlayground {

    canvas = document.getElementById('canvas');
    ctx = this.canvas.getContext('2d', {alpha: false});
    isDragging = false;

    originalImageWidth = 4096;
    originalImageHeight = 1600;

    size = {
        current: {
            width: 0,
            height: 0,
        },
        fit: {
            width: 0,
            height: 0,
        },
    };

    scale = {
        fitAxis: '',
        current: 0,
        fit: 0,
    };

    position = {
        x: 0,
        y: 0,
    }

    panDragStart = {
        x: 0,
        y: 0
    };

    is360 = true;

    photo = new Image();

    constructor() {
        this.setCanvasDimensions()
        this.photo.src = './photos/canvasTestPhoto.png';

        this.photo.addEventListener('load', () => {
            this.drawImage()
            this.panActivation();
            this.zoomActivation()
        });

        window.addEventListener('resize', () => {
            this.drawImage()
            this.panActivation();
            this.zoomActivation()
        });
        this.setScaleForZooming();
        this.setSizesByScale();
    }

    setCanvasDimensions() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getPanEventLocation = (e) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    }

    onPanStart = (e) => {
        this.isDragging = true;
        this.panDragStart = {
            x: this.getPanEventLocation(e).x - this.position.x,
            y: this.getPanEventLocation(e).y - this.position.y
        }
    };

    onPanStop = () => {
        this.isDragging = false;
    }

    panHandler = (e) => {
        let position;
        if (this.isDragging) {
            position = {
                x: this.getPanEventLocation(e).x - this.panDragStart.x,
                y: this.getPanEventLocation(e).y - this.panDragStart.y
            };
            this.moveImage(position.x, position.y);
        }
    }

    setScaleForZooming = () => {
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imageRatio = this.originalImageWidth / this.originalImageHeight;
        const fitAxis = canvasRatio < imageRatio ? 'x' : 'y';
        let fitRatio;

        if (fitAxis === 'x') {
            fitRatio = this.canvas.height / this.originalImageHeight;
        } else if (fitAxis === 'y') {
            fitRatio = this.canvas.width / this.originalImageWidth;
        }

        let current = fitRatio;

        this.scale = {
            fitAxis,
            current,
            fit: fitRatio,
        };
    }

    setSizesByScale = () => {
        this.size = {
            current: {
                width: this.originalImageWidth * this.scale.current,
                height: this.originalImageHeight * this.scale.current
            },
            fit: {
                width: this.originalImageWidth * this.scale.fit,
                height: this.originalImageHeight * this.scale.fit
            },
        }
    }

    zoomHandler = (e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 'out' : 'in';
        const imagePosition = this.getZoomImagePosition(e.pageX, e.pageY, direction);
        this.moveImage(imagePosition.x, imagePosition.y)
    }

    moveImage = (x, y) => {
        this.updatePosition(x, y);
        this.drawImage();
    }

    updatePosition(x, y) {
        this.position = this.getNextPosition(x, y)
    }

    drawImage = () => {
        this.ctx.save();

        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.scale(this.scale.current, this.scale.current);

        for (let i = 0; i < 4; i++) {
            const nextX = i * this.originalImageWidth;
            this.ctx.drawImage(this.photo, nextX, 0, this.originalImageWidth, this.originalImageHeight);
        }

        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.restore();
    }

    getNextPosition = (x, y) => {
        const isUnderFitScale = this.scale.current < this.scale.fit;

        if (this.is360) {
            const minX = -this.size.current.width;
            const maxX = 0;
            const minY = this.canvas.height - this.size.current.height;
            const maxY = 0;

            if (x > maxX) {
                x = -this.size.current.width + x;
            } else if (x < minX) {
                x = x + this.size.current.width;
            }

            if (isUnderFitScale) {
                y = (this.size.fit.height - this.size.current.height) / 2;
            } else if (y >= maxY) {
                y = maxY;
            } else if (y <= minY) {
                y = minY;
            }
        } else {
            const minX = -(this.size.current.width - this.canvas.width);
            const maxX = 0;
            const minY = this.canvas.height - this.size.current.height;
            const maxY = 0;

            if (isUnderFitScale) {
                if (this.scale.fitAxis === 'x') {
                    if (x > maxX) {
                        x = maxX;
                    } else if (x < minX) {
                        x = minX;
                    }
                } else if (this.scale.fitAxis === 'y') {
                    x = (this.canvas.width - this.size.current.width) / 2;
                }
            } else if (x > maxX) {
                x = maxX;
            } else if (x < minX) {
                x = minX;
            }

            if (isUnderFitScale) {
                if (this.scale.fitAxis === 'x') {
                    y = (this.size.fit.height - this.size.current.height) / 2;
                } else if (this.scale.fitAxis === 'y') {
                    if (y > maxY) {
                        y = maxY;
                    } else if (y < minY) {
                        y = minY;
                    }
                }
            } else if (y > maxY) {
                y = maxY;
            } else if (y < minY) {
                y = minY;
            }
        }

        return { x, y };
    }

    getZoomImagePosition = (mouseX, mouseY, direction) => {
        const imagePosition = {x: this.position.x, y: this.position.y};
        const prevImageHeight = this.size.current.height;
        const zoomPercentage = 10;
        let zoomFactor;

        if (direction === 'in') {
            zoomFactor = zoomPercentage / 100;
        } else {
            zoomFactor = (prevImageHeight * 100) / (zoomPercentage + 100) / prevImageHeight - 1;
        }

        const scaleBaseValue = prevImageHeight * zoomFactor;
        const currentImageSize = this.scaleBy(scaleBaseValue);
        const ratioX = currentImageSize.height / prevImageHeight;

        let nextX = ratioX * (mouseX + -imagePosition.x) - (mouseX + -imagePosition.x);
        let nextY = ratioX * (mouseY + -imagePosition.y) - (mouseY + -imagePosition.y);

        nextX = imagePosition.x + -nextX;
        nextY = imagePosition.y + -nextY;

        return {
            x: nextX,
            y: nextY
        }
    }

    scaleBy = (value) => {
        const newImageHeight = this.size.current.height + value;
        this.scale.current = newImageHeight / this.originalImageHeight;

            this.size.current = {
                width: this.originalImageWidth * this.scale.current,
                height: this.originalImageHeight * this.scale.current
        }
        return this.size.current
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
