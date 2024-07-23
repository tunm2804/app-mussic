/**
    1. render songs 
    2. scroll top 
    3. Play / pause / seek 
    4. CD rotate 
    5. next / prev
    6. random
    7. next / repeat when ended
    8. active song
    9. scroll active song into view
    10. play song when click
 */
const PLAYER_STORAGE_KEY = "It's you";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playlist = $(".playlist");
const cd = $(".cd");
const cdThumb = $(".cd__thumb");
const progress = $("#progress");

const audio = $("#audio");
const nameCd = $(".dashboard__name-song");

const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const repeatBtn = $(".btn-repeat");
const randomBtn = $(".btn-random");

// let songs;

const volume = $("#volume");
const volumeBox = $(".volume-box");

const app = {
    isVolumeOpen: false,
    isPlay: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    setupToConfig() {
        if (this.isRandom) {
            this.handleRandomSongs();
            randomBtn.classList.add("active");
            this.currentIndex = 0;
        }
        if (this.isRepeat) {
            repeatBtn.classList.add("active");
        }
    },
    currentIndex: 0,
    defineProperties() {
        Object.defineProperty(this, "currentSong", {
            get() {
                return this.songs[this.currentIndex];
            },
        });
    },
    loadCurrentSong() {
        if (this.isRandom) {
            audio.src = this.randomSongs[this.currentIndex].path;
            nameCd.innerText = this.randomSongs[this.currentIndex].name;
            cdThumb.style.backgroundImage = `url('${
                this.randomSongs[this.currentIndex].image
            }')`;
        } else {
            audio.src = this.currentSong.path;
            nameCd.innerText = this.currentSong.name;
            cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        }
    },
    songs: [
        {
            name: "Mashup tiktok",
            author: "Toptop",
            image: "./assets/img/favicon.jpg",
            path: "./assets/music/song11.mp3",
        },
        {
            name: "FuDo Milan ",
            author: "Lil Vantop",
            image: "./assets/img/favicon.jpg",
            path: "./assets/music/FuDo Milan - Lil Van.mp3",
        },
        {
            name: "Đánh đổi ",
            author: "Obito",
            image: "./assets/img/favicon.jpg",
            path: "./assets/music/Obito - Đánh Đổi ft. MCK.mp3",
        },
    ],
    randomSongs: [],
    render() {
        let htmls;
        if (this.isRandom) {
            htmls = this.randomSongs.map(
                (song, index) =>
                    `
                    <div class="song${
                        index === this.currentIndex ? " active" : ""
                    }" data-id = ${index}>
                        <div class="thumb" style="background-image: url('${
                            song.image
                        }')"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.author}</p>
                        </div>
                        <div class="option">
                            <i class="fa-solid fa-ellipsis"></i>
                            <ul class="option__menu">
                                <li class="option__item option__item--remove">Remove this song</li>
                            </ul>
                        </div>
                    </div>
                `
            );
        } else {
            htmls = this.songs.map(
                (song, index) =>
                    `
                    <div class="song${
                        index === this.currentIndex ? " active" : ""
                    }" data-id = ${index}>
                        <div class="thumb" style="background-image: url('${
                            song.image
                        }')"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.author}</p>
                        </div>
                        <div class="option">
                            <i class="fa-solid fa-ellipsis"></i>
                            <ul class="option__menu">
                                <li class="option__item option__item--remove">Remove this song</li>
                            </ul>
                        </div>
                    </div>
                `
            );
        }
        playlist.innerHTML = htmls.join("");
    },
    handleEvents() {
        const _this = this;

        // set up settings

        // hide / appear CD thumb when user scroll to bottom
        // hide/ appear volume custom
        const cdHeight = cd.offsetWidth;
        document.onscroll = function () {
            const scrollHeight =
                window.scrollY || document.documentElement.scrollTop;
            const cdNewHeight = cdHeight - scrollHeight;
            const cdOpacity = cdNewHeight / cdHeight;
            // Cd thumb
            if (cdHeight < cdNewHeight) {
                cd.style.width = cdHeight;
                cdOpacity = 1;
            } else if (cdHeight >= cdNewHeight) {
                Object.assign(cd.style, {
                    width: cdNewHeight + "px",
                    opacity: cdOpacity,
                });
            } else if (cdNewHeight < 0) {
                cd.style.width = 0;
            }
            // volume
            const volumeOpacity = 2 * cdOpacity - 1;
            if (cdNewHeight < cdHeight / 2) {
                volumeBox.style.display = "none";
            } else {
                volumeBox.style.display = "block";
                volumeBox.style.opacity = volumeOpacity;
                volumeBox.style["--fadeIn-to"] = volumeOpacity;
            }
        };

        // play or pause song when click toggle button
        playBtn.onclick = function () {
            if (_this.isPlay) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // progress thumb follow audio current time
        audio.ontimeupdate = function () {
            const percentSongComplete = Math.floor(
                (audio.currentTime / audio.duration) * 100
            );

            if (audio.currentTime) {
                progress.value = percentSongComplete;
                progress.style.backgroundImage = `linear-gradient(90deg, #ec1f55 ${percentSongComplete}%, transparent 0%)`;
            }
        };

        // seek audio
        progress.oninput = function () {
            audio.currentTime = (progress.value * audio.duration) / 100;
        };

        // handle when audio play
        audio.onplay = function () {
            _this.isPlay = true;
            playBtn.classList.add("playing");
            cdRotate.play();
        };
        // handle when audio pause
        audio.onpause = function () {
            _this.isPlay = false;
            playBtn.classList.remove("playing");
            cdRotate.pause();
        };

        // rotate CD
        const cdRotate = cdThumb.animate(
            {
                transform: "rotate(360deg)",
            },
            {
                duration: 10000,
                iterations: Infinity,
            }
        );
        cdRotate.pause();

        // next button on click
        nextBtn.onclick = function () {
            _this.nextSong();
            _this.activeSong();
            audio.play();
            _this.scrollActiveSongIntoView();
        };

        // prev button on click
        prevBtn.onclick = function () {
            _this.prevSong();
            _this.activeSong();
            audio.play();
            _this.scrollActiveSongIntoView();
        };

        // random button on click
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            this.classList.toggle("active", _this.isRandom);
            _this.handleRandomSongs();
            _this.render();
            handleSongWhenClick();
            if (!_this.isPlay) {
                audio.play();
            }
            _this.scrollActiveSongIntoView();
            _this.setConfig("isRandom", _this.isRandom);
        };

        // repeat button onclick
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            this.classList.toggle("active", _this.isRepeat);
            if (!_this.isPlay) {
                audio.play();
            }
            _this.setConfig("isRepeat", _this.isRepeat);
        };

        // next or replay song when ended
        audio.onended = function () {
            if (_this.isRepeat) {
                this.play();
            } else {
                nextBtn.click();
            }
        };

        // active song in playlist when click into song and handle option song
        // active song in playlist
        handleSongWhenClick();

        // when use render() force use handleSongWhenClick() because handleSongWhenClick() work related render()
        function handleSongWhenClick() {
            // play song when click
            songs = $$(".song");
            songs.forEach((song, index) => {
                song.onclick = function (e) {
                    const isOption = !!e.target.closest(".option");
                    if (isOption) {
                    } else {
                        _this.currentIndex = index;
                        _this.loadCurrentSong();
                        _this.activeSong();
                        audio.play();
                    }
                };
            });

            // remove song when click remove option
            removeSong();
        }

        // handle option song
        function removeSong() {
            const removeOptions = $$(".option__item--remove");
            removeOptions.forEach((option, index) => {
                option.onclick = function (e) {
                    if (_this.isRandom) {
                        const newIndex = _this.songs.indexOf(
                            _this.randomSongs[index]
                        );
                        _this.songs.splice(newIndex, 1);
                        _this.randomSongs.splice(index, 1);
                        if (index < _this.currentIndex) {
                            _this.currentIndex--;
                        } else if (
                            _this.currentIndex === _this.randomSongs.length
                        ) {
                            _this.currentIndex = 0;
                        }
                    } else {
                        _this.songs.splice(index, 1);
                        if (index < _this.currentIndex) {
                            _this.currentIndex--;
                        } else if (_this.currentIndex === _this.songs.length) {
                            _this.currentIndex = 0;
                        }
                    }

                    if (e.target.closest(".song.active")) {
                        _this.loadCurrentSong();
                        audio.play();
                        _this.scrollActiveSongIntoView();
                    }
                    _this.render();
                    handleSongWhenClick();
                };
            });
        }

        // custom volume of audio
        volume.value = audio.volume * 100;
        volume.style.backgroundImage = `linear-gradient(90deg, #ec1f55 ${volume.value}%, transparent 0%)`;
        volume.oninput = function () {
            const newAudioVolume = volume.value / 100;
            audio.volume = volume.value / 100;
            volume.style.backgroundImage = `linear-gradient(90deg, #ec1f55 ${
                newAudioVolume * 100
            }%, transparent 0%)`;
        };
    },
    activeSong() {
        $(".song.active").classList.remove("active");
        const playlistNow = $$(".song");
        playlistNow[this.currentIndex].classList.add("active");
    },
    scrollActiveSongIntoView() {
        setTimeout(function () {
            $(".song.active").scrollIntoView({
                behaviour: "smooth",
                block: "end",
            });
        }, 100);
    },
    handleRandomSongs() {
        if (this.isRandom) {
            const lengthSongs = this.songs.length;
            let randomSongs = [];
            while (randomSongs.length < lengthSongs) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * lengthSongs);
                } while (randomIndex >= lengthSongs);
                const available = randomSongs.find(
                    (randomSong) => randomSong == this.songs[randomIndex]
                );
                if (!available) {
                    randomSongs.push(this.songs[randomIndex]);
                }
            }
            this.randomSongs = randomSongs;
        }
        this.swapIndex();
    },
    swapIndex() {
        const _this = this;
        let newIndex;
        if (this.isRandom) {
            newIndex = this.randomSongs.indexOf(
                _this.songs[_this.currentIndex]
            );
            _this.currentIndex = newIndex;
        } else {
            newIndex = this.songs.indexOf(
                _this.randomSongs[_this.currentIndex]
            );
            _this.currentIndex = newIndex;
        }
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    start() {
        this.loadConfig();
        this.setupToConfig();
        this.defineProperties();
        this.loadCurrentSong();
        // render before handleEvents because function handleSongWhenClick() work related songs in playlist
        this.render();
        this.handleEvents();
    },
};

app.start();
