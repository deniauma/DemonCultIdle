import CULT from './cult.js'
import RITUALS from './ritual.js'


class Game {
    constructor() {
        this.dt = 30;
        this.current_time = window.performance.now();
        this.accumulator = 0;
        this.cult = CULT;
        this.rituals = RITUALS;
    }

    update_pps() {
        let x = 0;
        this.upgrades.forEach((upg) => {
            x += upg.nb;
        });
        this.pps = x;
    }

    game_render() {
        this.cult.render();
        this.rituals.render();
    }
    
    game_tick() {
        let delta = this.dt/1000;
        this.cult.tick(delta);
    }
    
    main_loop() {
        let new_time = window.performance.now();
        let frame_time = new_time - this.current_time;
        if (frame_time > 10000) {
            console.log('You were offline for ' + frame_time/1000 + " sec!");
        }
        this.current_time = new_time;
        this.accumulator += frame_time;
        while (this.accumulator >= this.dt) {
            this.game_tick();
            this.accumulator -= this.dt;
        }
        
        this.game_render();
        requestAnimationFrame(() => {
            this.main_loop();
        });
    }
}


var game = new Game();
game.main_loop();