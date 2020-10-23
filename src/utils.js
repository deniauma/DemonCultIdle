export class Resource {
    constructor(base_cost, cost_pow) {
        this.base_cost = base_cost;
        this.cost_pow = cost_pow;
        this.level = 0;
    }

    next_level_cost() {
        return Math.round(this.base_cost * Math.pow(this.cost_pow, this.level));
    }


}


export class Automation {
    constructor(delay) {
        this.dt = 30;
        this.delay = delay;
        this.progress = 0;
        this.progress_tick = 100/(this.delay/this.dt);
        this.automated = true;
        this.automated_amount = 1;
        this.total = 0;
    }

    update() {
        if(this.automated) {
            this.progress += this.progress_tick;
            if (this.progress > 100) {
                this.progress = 100;
            }
            if (this.progress == 100) {
                this.total += this.automated_amount;
                this.progress = 0;
            }
            // document.querySelector('.progress-curr').style.width = this.progress + '%';
        }
        
    }

    activate(bool) {
        this.automated = bool;
    }

    set_delay(delay) {
        this.delay = delay;
        this.progress_tick = 100/(this.delay/this.dt);
    }
}