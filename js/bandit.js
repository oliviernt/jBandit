(function(window, $){
    $.fn.jBandit = function(options){
        var defaults = {
            autoPlay: true,
            direction: "vertical",//valid values: "vertical" | "horizontal"
            shift: true,//valid values: true | "next" | "previous"
            pager: true,
            pagerBullets: false,
            listType: "ul",//valid values: "ul" | "ol"
            timeout: 1000
        },
        maxHeight = 100,
        maxWidth = 75,
        values = {
            "horizontal": {
                "left" : maxWidth,
                "top" : 0
            },
            "vertical" : {
                "left" : 0,
                "top" : maxHeight
            }
        };
        
        options = $.extend(defaults, options);
        
        /***
         * Main Explanation:
         * A "Kachel" is a list element containing a link and an image
         * E.g.:
         * <li>
         *  <a href="#">
         *   <img src="" />
         *  </a>
         * </li>
         */
        
        /***
         * get a random number in a min to max range
         */
        var randomInRange = function(min, max) {
          return Math.round(min+(Math.random()*(max-min)));
        }
        
        /***
         * activates a random Kachel
         */
        var activateRandom = function($arr, max, isNext){
            var rand = randomInRange(0, max),
                css = {};
            if (options.direction === "horizontal") {
                if (isNext) {
                    css.left = "-" + maxWidth + "px";
                }
                else {
                    css.left = maxWidth + "px";
                }
            }
            else if (options.direction === "vertical") {
                if (isNext) {
                    css.top = "-" + maxHeight + "px";
                }
                else {
                    css.top = maxHeight + "px";
                }
            }
            $("li:not(.active)", $arr.parent()).css(css);

            css = {};
            if (options.direction === "horizontal") {
                css.left = 0;
            }
            else if (options.direction === "vertical") {
                css.top = 0;
            }

            $($arr[rand]).addClass("active").css(css);
            return rand;
        };
        
        /***
         * activates the next Kachel in a (un)ordered list
         */
        var next = function($list, active) {
            var $arr = $list.find("li"),
                animate = {
                    left: values[options.direction].left + "px",
                    top: values[options.direction].top + "px"
                };

            $($arr[active]).removeClass("active").animate(animate, function(){
                var css = {
                    left: -values[options.direction].left + "px",
                    top: -values[options.direction].top + "px"
                };
                $("li:not(.active)", $list).css(css);
            });
            active++;
            if (active >= $arr.length || active < 0 || !$arr[active]) {
                active = 0;
            }

            animate = {
                left : 0,
                top : 0
            }
            $($arr[active]).addClass("active").animate(animate);
            if (options.pager) {
                updatePager($list, active);
            }
            return active;
        };
        
        /***
         * activates the previous Kachel in a (un)ordered list
         */
        var previous = function($list, active) {
            var $arr = $list.find("li"),
                animate = {
                    left: -values[options.direction].left + "px",
                    top: -values[options.direction].top + "px"
                };

            $($arr[active]).removeClass("active").animate(animate, function(){
                var css = {
                    left: values[options.direction].left + "px",
                    top: values[options.direction].top + "px"
                };
                $("li:not(.active)", $list).css(css);
            });
            active--;
            if (active < 0 || !$arr[active]) {
                active = $arr.length -1;
            }

            animate = {
                left : 0,
                top : 0
            }
            $($arr[active]).addClass("active").animate(animate);
            if (options.pager) {
                updatePager($list, active);
            }
            return active;
        };

        var updatePager = function($list, active){
                $list.find("a.active").removeClass("active");
                $list.find("a.anchor-" + active).addClass("active");
        }
        
        return this.each(function(){
            var $this = $(this);
            $this.addClass("bandit");

            //Set maximum image height/width as maxHeight/maxWidth
            $this.find("img").each(function(){
                var $img = $(this),
                    width = $img.width(),
                    height = $img.height();
                if ( width > maxWidth ) {
                    maxWidth = width;
                    values.horizontal.left = maxWidth;
                }
                if ( height > maxHeight ){
                    maxHeight = height;
                    values.vertical.top = maxHeight;
                }
            });

            $this.find(options.listType + ", " + options.listType + " li").css({
                "height" : maxHeight + "px",
                "width" : maxWidth + "px"
            });
            
            $this.find(options.listType).each(function(j, ul){
                var $ul = $(ul),
                    $liArr = $ul.find("li"),// the Kachel Array
                    $aArr = $ul.find("a"),
                    interval = null,
                    isNext = ((j % 2 == 0 && options.shift === true) || options.shift === false || options.shift === "next");

                if (isNext) {
                    $ul.addClass("next");
                }
                else {
                    $ul.addClass("previous");
                }
                
                var act = activateRandom($liArr, $liArr.length, isNext);

                var start = function(){
                    if (options.autoPlay) {
                        interval = setInterval(function(){
                            if (isNext) {
                                act = next($ul, act);
                            }
                            else {
                                act = previous($ul, act);
                            }
                        }, options.timeout);
                    }
                }

                var stop = function(){
                    if (options.autoPlay && interval) {
                        clearInterval(interval);
                    }
                };

                start();

                $aArr.each(function(k, a){
                    $(a).on("mouseover.bandit", stop).on("mouseout.bandit", start);
                });

                //if a pager should be displayed for each Kachel
                if ( options.pager ) {
                    $liArr.each(function(i, li){
                        var $a = $('<a />').html(options.bullets?"*":i+1).attr({
                            "href" : "#"
                        }).addClass("anchors anchor-"+i).css({
                            "top" : i + "0px"
                        }).data({
                            "index": i
                        }).on("click.bandit", function(){
                            $($liArr[act]).css({
                                top: (isNext?"":"-") + maxHeight + "px",
                                zIndex: 0
                            });
                            act = $(this).data("index");
                            $($liArr[act]).css({
                                top: 0,
                                left: 0,
                                zIndex: 99
                            });
                            updatePager($ul, act);
                            return false;
                        }).on("mouseover.bandit", stop).on("mouseout.bandit", start);
                        $ul.append($a);
                    });
                }
                
            });
        });
    };
})(window, jQuery);