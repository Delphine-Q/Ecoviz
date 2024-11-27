$(document).ready(function() {
    // Enveloppe chaque modal dans une overlay
    $(".modal").each(function() {
        $(this).wrap('<div class="overlay"></div>');
    });

    // Ouvre la modal lorsqu'on clique sur le bouton
    $(".open-modal").on('click', function(e) {
        e.preventDefault(); // Empêche le comportement par défaut du lien

        var $this = $(this),
            modal = $this.data("modal");

        $(modal).parents(".overlay").addClass("open"); // Ouvre l'overlay

        setTimeout(function() {
            $(modal).addClass("open"); // Ouvre la modal après un délai
        }, 350);
    });

    // Ferme la modal lorsqu'on clique en dehors de celle-ci
    $(document).on('click', function(e) {
        var target = $(e.target);

        if (target.hasClass("overlay")) {
            target.find(".modal").each(function() {
                $(this).removeClass("open");
            });
            setTimeout(function() {
                target.removeClass("open");
            }, 350);
        }
    });

    // Ferme la modal lorsqu'on clique sur le bouton "Close"
    $(".close-modal").on('click', function(e) {
        e.preventDefault();

        var $this = $(this),
            modal = $this.data("modal");

        $(modal).removeClass("open");
        setTimeout(function() {
            $(modal).parents(".overlay").removeClass("open");
        }, 350);
    });
});