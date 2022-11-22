const DynamicFunction = {

    getDate: function () {
        const date = new Date();
        return date.toLocaleDateString()
    },

    getMode: function () {
        const date = new Date();
        const hour = date.getHours()

        return (hour > 19 || hour < 6) ? "dark" : ""
    },
}


module.exports = DynamicFunction