var currentRotation = 180 / 18;
const element = document.getElementById('wheel');
var l = [
    "$10",
    "$15",
    "$110",
    "$10",
    "$20",
    "$15",
    "$20",
    "$10",
    "$200",
    "$10",
    "$15",
    "$70",
    "$15",
    "$10",
    "$100",
    "$15",
    "$10",
    "$50"
]
element.style.transform = `rotate(${currentRotation}deg)`;

function rotateElement() {

    const element = document.getElementById('wheel');
    let dor = Math.floor(Math.random() * (8 - 3 + 1)) + 3;
    dor = (dor * 360) + 1800;
    let min = 1;
    let max = 359;
    let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    dor += randomNumber;
    const newRotation = currentRotation + dor;

    animation = wheel.animate([
        { transform: `rotate(${newRotation}deg)` }
    ], {
        duration: 15000,
        direction: 'normal',
        easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)',
        fill: 'forwards',
        iterations: 1
    });

    animation.onfinish = () => {
        element.style.transform = `rotate(${newRotation}deg)`;

        let i = Math.ceil(randomNumber / 20) - 18;
        var t = l[Math.abs(i)];
        $('button').text(t);
    };
}