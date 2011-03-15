(function ($) {
    var myResume;

    $(document).ready(function () {
        // initialize the status bar
        var status = $('#status');

        status.html('Please wait while loading ... ');

        $.ajax({
            type: "GET",
            url: "resume.json",
            dataType: "json",
            success: function (data) {
                try {
                    myResume = data;
                    buildResumeUi();

                    $('#status').hide();
                }
                catch (e) {
                    reportError(e);
                }
            },
            error: function (a, msg, c) {
                reportError(msg + ': ' + c);
            }
        });
    });

    function reportError(msg) {
        $('#status').html(msg);
    }

    function sortByName(a, b) {
        var xa = a.name.toUpperCase(), xb = b.name.toUpperCase();

        if (xa == xb) {
            return 0;
        } else if (xa < xb) {
            return -1;
        } else {
            return 1;
        }
    }

    function buildViewModel(resume) {
        var experiences = resume.experiences;

        var skillsCatalog = resume.catalog;

//        skillsCatalog.sort(sortByName);

        for (var x = 0; x < skillsCatalog.length; x++) {
            skillsCatalog[x].skills.sort(sortByName);
        }

        skillsCatalog.findSkill = function (key) {
            for (var x = 0; x < this.length; x++) {
                var category = this[x];

                for (var y = 0; y < category.skills.length; y++) {
                    var skill = category.skills[y];

                    if (skill.key == key) {
                        return {
                            "key": skill.key,
                            "name": skill.name,
                            "category": category.name,
                            "href": skill.href
                        }
                    }
                }
            }

            return { key: key, name: key, category: "Skills" };
        };

        for (var eIndex = 0; eIndex < experiences.length; eIndex++) {
            var experience = experiences[eIndex];

            if (experience.start == experience.end) {
                experience.timespan = '' + experience.start;
            } else if (experience.end) {
                experience.timespan = '' + experience.start + ' - ' + experience.end;
            } else {
                experience.timespan = '' + experience.start + ' - current';
            }

            var skillKeys = experience.skillKeys;
            experience.categories = new Array();

            for (var sIndex = 0; sIndex < skillKeys.length; sIndex++) {
                var key = skillKeys[sIndex].key;
                var skill = skillsCatalog.findSkill(key);

                var category = null;
                for (var categoryIndex = 0; categoryIndex < experience.categories.length; categoryIndex++) {
                    if (experience.categories[categoryIndex].name == skill.category) {
                        category = experience.categories[categoryIndex];
                        break;
                    }
                }

                if (category == null) {
                    var category = { skills: new Array(), name: skill.category };
                    experience.categories[experience.categories.length] = category;
                }

                category.skills[category.skills.length] = skill;
            }

            experience.categories.sort(sortByName);
            for (var c = 0; c < experience.categories.length; c++) {
                experience.categories[c].skills.sort(sortByName);
            }
        }

        return resume;
    }

    var resumeTemplateName = "resumeTemplate";
    function buildResumeUi() {
        var viewModel = buildViewModel(myResume);

        $('#resume-template').tmpl(viewModel).appendTo("#content");

        $('#content').delegate('.skill-define,.skill-use', 'hover', function () {
            var key = $(this).attr('skill-key');
            var skills = $('[skill-key="' + key + '"],.experience:has([skill-key="' + key + '"])')
            skills.toggleClass('skill-highlight');
        })
        .delegate('.toggle-skills', 'click', function () {
            var parents = $(this).parents('.experience')
            parents.toggleClass('show-skills');
        })
        .delegate('.toggle-skills-catalog', 'click', function () {
            $('.skills-category').toggle();
        });
    }
})(jQuery);
