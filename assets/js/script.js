const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER";

const dashboardTitle = $(".dashboard__title");
const dashboardImg = $(".dashboard__img");
const dashboardProgress = $(".dashboard__progress");
const audio = $("#audio");
const playList = $(".playlist");

const playBtn = $("#play");
const prevBtn = $("#prev");
const nextBtn = $("#next");
const repeatBtn = $("#repeat");
const randomBtn = $("#random");

function Song(name, singer, avatar, path) {
    this.name = name;
    this.singer = singer;
    this.avatar = avatar;
    this.path = path;
}

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    //Danh sách bài hát
    songs: [
        new Song(
            "Em đây chẳng phải thúy kiều",
            "Hoàng Thùy Linh x HTH x H20",
            "./assets/img/song1.jpg",
            "./assets/music/song1.mp3"
        ),
        new Song(
            "Chăm hoa",
            "MONO",
            "./assets/img/song2.jpg",
            "./assets/music/song2.mp3"
        ),
        new Song(
            "HOA CỎ LAU",
            "PHONG MAX",
            "./assets/img/song3.jpg",
            "./assets/music/song3.mp3"
        ),
        new Song(
            "Ex's Hate Me",
            "B Ray x Masew x AMee",
            "./assets/img/song4.jpg",
            "./assets/music/song4.mp3"
        ),
        new Song(
            "Cưới thôi",
            "Masiu x Masew",
            "./assets/img/song5.jpg",
            "./assets/music/song5.mp3"
        ),
        new Song(
            "Một Lần Dang Dở",
            "H2K x KProx",
            "./assets/img/song6.jpg",
            "./assets/music/song6.mp3"
        ),
        new Song(
            "Tình Ca Tình Ta",
            "kis",
            "./assets/img/song7.jpg",
            "./assets/music/song7.mp3"
        ),
        new Song(
            "PC - 10 Ngàn Năm",
            "Prod. Duckie",
            "./assets/img/song8.jpg",
            "./assets/music/song8.mp3"
        ),
        new Song(
            "Em Hát Ai Nghe",
            "Orange",
            "./assets/img/song9.jpg",
            "./assets/music/song9.mp3"
        ),
        new Song(
            "Tương Phùng",
            "Long Nón Lá x The 199x",
            "./assets/img/song10.jpg",
            "./assets/music/song10.mp3"
        ),
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <li class="song ${
                    index === this.currentIndex ? "song--active" : ""
                }" data-index="${index}">
                    <img class="song__img" src="${song.avatar}">
                    <div class="song__text">
                        <h3 class="song__title">
                            ${song.name}
                        </h3>
                        <div class="song__desc">${song.singer}</div>
                    </div>
                    <button class="song__btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </li>
            `;
        });

        playList.innerHTML = htmls.join("");
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const _this = this;
        const dashboardImgWidth = dashboardImg.offsetWidth;

        //Xử lý quay ảnh đại diện bài hát
        const dashboardImgAnimate = dashboardImg.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 10000,
                iterations: Infinity,
            }
        );

        dashboardImgAnimate.pause();

        //Xử lý scroll ảnh đại diện bài hát
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;

            const newWidth =
                dashboardImgWidth - scrollTop < 0
                    ? 0
                    : dashboardImgWidth - scrollTop;

            dashboardImg.style.width = newWidth + "px";
            dashboardImg.style.height = newWidth + "px";
            dashboardImg.style.opacity = newWidth / dashboardImgWidth;
        };

        //Xử lý sự kiện click play/pause bài hát
        playBtn.onclick = function () {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        };

        audio.onplay = function () {
            dashboardImgAnimate.play();
            playBtn.classList.add("music--play");
        };

        audio.onpause = function () {
            dashboardImgAnimate.pause();
            playBtn.classList.remove("music--play");
        };

        //Xử lý chuyển bài hát khi hết bài hát
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            dashboardProgress.value = audio.currentTime;
            if (audio.duration) {
                dashboardProgress.max = audio.duration;
            }
        };

        //Khi tua bài hát
        dashboardProgress.oninput = function () {
            audio.currentTime = dashboardProgress.value;
        };

        //Khi prev bài hát
        prevBtn.onclick = function () {
            const prevSongIndex = _this.currentIndex;
            const prevSong = $(".song[data-index='" + prevSongIndex + "']");

            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }

            const nextSongIndex = _this.currentIndex;
            const nextSong = $(".song[data-index='" + nextSongIndex + "']");
            _this.activeSong(prevSong, nextSong);
        };

        //Khi next bài hát
        nextBtn.onclick = function () {
            const prevSongIndex = _this.currentIndex;
            const prevSong = $(".song[data-index='" + prevSongIndex + "']");

            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }

            const nextSongIndex = _this.currentIndex;
            const nextSong = $(".song[data-index='" + nextSongIndex + "']");
            _this.activeSong(prevSong, nextSong);
        };

        //Xử lý sự kiện lặp lại một bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            this.classList.toggle("dashboard__btn--active", _this.isRepeat);
        };

        //Xử lý sự kiện ngẫu nhiên một bài hát
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            this.classList.toggle("dashboard__btn--active", _this.isRandom);
        };

        playList.onclick = function (event) {
            const songNode = event.target.closest(".song:not(.song--active)");

            //Xử lý sự kiện khi click vào bài hát trong playlist sẽ phát bài hát đó
            if (
                event.target.closest(".song:not(.song--active)") &&
                !event.target.closest(".song__btn")
            ) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.activeSong($(".song.song--active"), songNode);
                audio.play();
            }

            //Xử lý sự kiện khi click vào nút more của bài hát trong playlist
            if (event.target.closest(".song__btn")) {
            }
        };
    },

    //Tải bài hát hiện tại
    loadCurrentSong: function () {
        dashboardTitle.textContent = this.currentSong.name;
        dashboardImg.src = this.currentSong.avatar;
        audio.src = this.currentSong.path;
        this.setConfig("currentSong", this.currentSong);
    },

    //Tải cấu hình
    loadConfig: function () {
        if (this.config.currentSong) {
            const configCurrentSong = this.songs.find(
                (song) => song.name === this.config.currentSong.name
            );

            if (this.songs.includes(configCurrentSong)) {
                this.currentIndex = this.songs.indexOf(configCurrentSong);
            }
        }
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    //Phát bài hát trước
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        audio.play();
    },

    //Phát bài hát tiếp theo
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        audio.play();
    },

    //Phát bài hát ngẫu nhiên
    playRandomSong: function () {
        if (this.songs.length >= 1) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.songs.length);
            } while (newIndex === this.currentIndex);
            this.currentIndex = newIndex;
            this.loadCurrentSong();
            audio.play();
        }
    },

    //Kích hoạt bài hát
    activeSong: function (preSong, nextSong) {
        preSong.classList.remove("song--active");
        nextSong.classList.add("song--active");
        this.scrollToActiveSong();
    },

    //Cuộn đến bài hát đang phát
    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.song--active").scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 300);
    },

    //Khởi chạy ứng dụng
    start: function () {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        //Xử lý các sự kiện (DOM events)
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Tải danh sách bài hát vào UI khi chạy ứng dụng
        this.render();

        //Hiển thị trạng thái ban đầu của nút repeat và random
        repeatBtn.classList.toggle("dashboard__btn--active", this.isRepeat);
        randomBtn.classList.toggle("dashboard__btn--active", this.isRandom);
    },
};

app.start();
