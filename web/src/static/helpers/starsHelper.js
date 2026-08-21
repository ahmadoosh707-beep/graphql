import { starControl } from "../templates/stars.js";


function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}



export async function blackHoleTransition() {

    // Make sure stars are visible
    starControl.enabled = true;
    starControl.start();


    /*
        Phase 1:
        Slowly decelerate
    */

    let currentSpeed = starControl.speed;


    while (currentSpeed > 0.05) {

        currentSpeed *= 0.88;

        starControl.speed = currentSpeed;

        await sleep(20);
    }



    /*
        Phase 2:
        Everything stops
    */

    starControl.speed = 0;

    await sleep(20);



    /*
        Phase 3:
        Activate gravity
    */

    starControl.blackHole = true;

    starControl.blackHoleStrength = 0;



    for (let i = 0; i < 25; i++) {

        starControl.blackHoleStrength += 0.02;

        await sleep(5);
    }




    /*
        Phase 5:
        Hide stars
    */

    starControl.enabled = false;
}