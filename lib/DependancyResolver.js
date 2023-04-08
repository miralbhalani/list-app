

module.exports = class DependancyResolver {

    dependancies = {

    }

    constructor() {

    }

    addDependancy(depKey, dep) {
        this.dependancies[depKey] = dep;
    }

    attach(attachFunc) {
        return attachFunc(this.dependancies, this);
    }
}