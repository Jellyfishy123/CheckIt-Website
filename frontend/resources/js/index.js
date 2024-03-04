
document.querySelector("#newTaskStartDTButton").addEventListener("click", function () {
    flatpickr("#newTaskStartDT", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: false,
        clickOpens: false
    }).open();
});

document.querySelector("#newTaskEndDTButton").addEventListener("click", function () {
    flatpickr("#newTaskEndDT", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: false,
        clickOpens: false
    }).open();
});
