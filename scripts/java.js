$(document).ready(function() {
    // Enveloppe chaque modal dans une overlay
    $(".modal").each(function() {
        $(this).wrap('<div class="overlay"></div>');
    });

    // Ouvre la modal lorsqu'on clique sur le bouton
    $(".open-modal").on('click', function(e) {
        e.preventDefault(); // Empêche le comportement par défaut du lien

        var modalId = $(this).data("modal"); // Récupère l'ID de la modal
        if ($(modalId).length) { // Vérifie si l'élément existe
            $(modalId).parents(".overlay").addClass("open"); // Ouvre l'overlay

            setTimeout(function() {
                $(modalId).addClass("open"); // Ouvre la modal après un délai
            }, 350);
        } else {
            console.error("Modal not found: " + modalId); // Affiche une erreur si la modal n'existe pas
        }
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

        var modalId = $(this).data("modal");
        $(modalId).removeClass("open");
        setTimeout(function() {
            $(modalId).parents(".overlay").removeClass("open");
        }, 350);
    });

    // Gestion du bouton flottant
    $('.main-btn').on('click', function() {
        $('.float-btn ul').toggleClass('toggled');
    });
});