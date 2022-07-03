let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')

let cameraOffset = { x: 0, y: 0 }

function draw()
{
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at

    ctx.translate(cameraOffset.x, cameraOffset.y )

    ctx.fillStyle = "#991111"
    drawRect(0,0,100,100)


    requestAnimationFrame( draw )
}

function getEventLocation(e) {

    return { x: e.clientX, y: e.clientY }
}

function drawRect(x, y, width, height)
{
    ctx.fillRect( x, y, width, height )
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x - cameraOffset.x
    dragStart.y = getEventLocation(e).y - cameraOffset.y
}

function onPointerUp()
{
    isDragging = false
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x - dragStart.x
        cameraOffset.y = getEventLocation(e).y - dragStart.y
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('mousemove', onPointerMove)

draw()
