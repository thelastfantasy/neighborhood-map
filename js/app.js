var map;

function AppViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    // 地图标记被点击时，调用此函数显示信息框内容。
    // 该函数每次仅允许一个信息框被打开。
    this.populateInfoWindow = function (marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // 使用百度地图API获取街道地址对应信息
            var baiduKey = 'pty69pZINLt2GFkdhkd2G3qs6TpcZc9H',
                query = '银行';
            var apiUrl = 'http://api.map.baidu.com/place/v2/search?query=' + query + '&location=' + marker.lat + ',' + marker.lng + '&output=json&coord_type=2&ret_coordtype=gcj02ll&radius=15&scope=2&ak=' + baiduKey;

            $.ajax({
                type: 'GET',
                dataType: 'jsonp',
                data: {},
                url: apiUrl,
                error: function () {
                    // ajax失败时，alert报错
                    alert("获取数据失败，请刷新页面以重试！");
                },
                success: function (response) {
                    for (var i = 0; i < response.results.length; i++) {
                        if (response.results[i].detail_info.tag.indexOf('银行') >= 0) {
                            var bank = response.results[i];
                            self.tel = bank.telephone || '缺少数据';
                            self.address = bank.address;
                            self.url = bank.detail_info.detail_url;

                            self.infowindowContent =
                                '<div>' +
                                '<h6 class="iw_address_title"> 地址：</h6>' +
                                '<p class="iw_address">' + self.address + '</p>' +
                                '<p class="iw_address">电话：' + self.tel + '</p>' +
                                '<p class="iw_address"><a href=' + self.url + ' target="_blank">详细介绍>></a></p>' + '</div>' + '</div>';

                            infowindow.setContent(self.htmlContent + self.infowindowContent);
                            break;
                        }
                    }
                }
            });


            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function () {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function () {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(31.336851, 121.473227),
            zoom: 12,
            styles: styles
        };
        // 页面加载时的地图位置
        map = new google.maps.Map(mapCanvas, mapOptions);

        // 此处设置信息框
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].title;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    // 此处实现了一个简单的过滤器以控制地图标记的显示隐藏
    this.myLocationsFilter = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert('Google地图加载失败，请确认你的网络连接后刷新页面重试。');
};

function run() {
    ko.applyBindings(new AppViewModel());
}