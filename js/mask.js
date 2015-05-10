(function() {
    var maskId = '';
    $we.mask = function(type) {
        if (!maskId) {
            maskId = $we.createId();

            var size = $we.getPageSize();

            $(document.body).append([
                '<div class="" id="', maskId, '" style="width:', size.width, 'px;height:', size.height, 'px;"></div>'
            ].join(''));
        }

        var el = $('#' + maskId);
        el.get(0).className = 'wejs-mask';

        switch (type) {
            case 'loading':
                el.addClass('wejs-mask-loading');
                break;
            case 'hide':
                break;
        }

        if (type == 'hide') {
            el.hide();
        } else {
            el.show();
        }
    };

})();
