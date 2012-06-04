(function(window, $){
    $.fn.jBandit = function(options){
        var defaults = {
            autoPlay: true,
            shift: true,//valid values: true | false | "next" | "previous"
            pager: true,
            pagerBullets: false,
            listType: "ul"//valid values: "ul" | "ol"
        },
        maxHeight = 100,
        maxWidth = 75;
        
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
            var rand = randomInRange(0, max);
            $($arr[rand]).addClass("active").css("top", "0px");
            $("li:not(.active)", $arr.parent()).css("top", (isNext?"-"+maxHeight+"px":""+maxHeight+"px"));
            return rand;
        };
        
        /***
         * activates the next Kachel in a (un)ordered list
         */
        var next = function($list, active) {
            var $arr = $list.find("li");
            $($arr[active]).removeClass("active").animate({
                "top" : maxHeight+"px"
            }, function(){
                $("li:not(.active)", $list).css("top", "-"+maxHeight+"px");
            });
            active++;
            if (active >= $arr.length || active < 0 || !$arr[active]) {
                active = 0;
            }
            $($arr[active]).addClass("active").animate({
                "top" : "0"
            });
            return active;
        };
        
        /***
         * activates the previous Kachel in a unordered list
         */
        var previous = function($list, active) {
            var $arr = $list.find("li");
            $($arr[active]).removeClass("active").animate({
                "top" : "-"+maxHeight+"px"
            }, function(){
                $("li:not(.active)", $list).css("top", maxHeight+"px");
            });
            active--;
            if (active < 0 || !$arr[active]) {
                active = $arr.length -1;
            }
            $($arr[active]).addClass("active").animate({
                "top" : "0"
            });
            return active;
        };
        
        this.each(function(i, obj){
            var $this = $(obj);
            $this.addClass("bandit");

            //Set maximum image height/width as maxHeight/maxWidth
            $("img", $this).each(function(){
                var $img = $(this),
                    width = $img.width(),
                    height = $img.height();
                    if ( width > maxWidth ) {
                        maxWidth = width;
                    }
                    if ( height > maxHeight ){
                        maxHeight = height;
                    }
            });

            $(options.listType+", "+options.listType+" li", $this).css({
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
                        }, 2000);
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
                        }).css({
                            "top" : i + "0px"
                        }).data({
                            "index": i
                        }).on("click.bandit", function(){
                            $(".active", $ul).removeClass("active").css("top", (isNext?maxHeight+"px":"-"+maxHeight+"px"));
                            act = $(this).data("index");
                            $($liArr[act]).addClass("active").css("top", "0px");
                            return false;
                        }).on("mouseover.bandit", stop).on("mouseout.bandit", start);
                        $ul.append($a);
                    });
                }
                
            });
        });
    };
    $(window).load(function(){
        $(".bandit").jBandit();
    });
})(window, jQuery);