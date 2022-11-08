// Made with love by Chee Yong Lee (https://joe.js.org) https://github.com/leecheeyong
// This project is available as an open source under the MIT License
const customSearch = ["apple"];
const maxDuration = 5;
const getSize = require('get-folder-size');
const { performance } = require('perf_hooks');
const ytdl = require('ytdl-core');
const search = require("youtube-sr").default;
const fs = require('fs');
const path = require('path');
const videos = fs.readdirSync('./videos').filter(file => file.endsWith('.mp4'));
const downloaded = [];
const data = [];
const index = [];
var indexFile = require('./videos.json');


(async() => {
    //download homepage
    const t = performance.now();  
    const t0 = performance.now();
    for(let i = 0; i < 3; i++) {
    try {
    const homepage = await search.homepage();
    homepage.forEach(async (video) => {
        try {
        if(videos.includes(`${video.id}.mp4`)) return;
        if(downloaded.includes(video.id)) return;
        if((video.duration / 60 ) > maxDuration) return;
        await ytdl(`https://www.youtube.com/watch?v=${video.id}`).pipe(fs.createWriteStream(path.join(__dirname, 'videos', `${video.id}.mp4`)));
        downloaded.push(video.id);
        data.push({
            id: video.id,
            title: video.title,
            duration: video.duration,
            channel: {
                name: video.channel.name,
                id: video.channel.id
            }
        })
        } catch (e) {
            console.log(e);
        }
    });
    } catch (e) { console.log(e) }
    }
    const t1 = performance.now();
    console.log(`Downloaded homepage in ${msTmin(t1 - t0)} milliseconds.`);
    //download trending
    const t2 = performance.now();
    for(let i = 0; i < 3; i++) {
    try {
    const trending = await search.trending();
    trending.forEach(async (video) => {
        try {
        if(videos.includes(`${video.id}.mp4`)) return;
        if(downloaded.includes(video.id)) return;
        if((video.duration / 60 ) > maxDuration) return;
        await ytdl(`https://www.youtube.com/watch?v=${video.id}`).pipe(fs.createWriteStream(path.join(__dirname, 'videos', `${video.id}.mp4`)));
        downloaded.push(video.id);
        data.push({
            id: video.id,
            title: video.title,
            duration: video.duration,
            channel: {
                name: video.channel.name,
                id: video.channel.id
            }
        })
        } catch (e) {
            console.log(e);
        }
    });
    } catch (e) { console.log(e); }
    }
    // download search
    const t4 = performance.now();
    customSearch.forEach(async e => {
        try {
        const info = await search.search(e, { limit: 5 });
        info.forEach(async (video) => {
            try {
            if(videos.includes(`${video.id}.mp4`)) return;
            if(downloaded.includes(video.id)) return;
            if((video.duration / 60 ) > maxDuration) return;
            await ytdl(`https://www.youtube.com/watch?v=${video.id}`).pipe(fs.createWriteStream(path.join(__dirname, 'videos', `${video.id}.mp4`)));
            downloaded.push(video.id);
            data.push({
                id: video.id,
                title: video.title,
                duration: video.duration,
                channel: {
                    name: video.channel.name,
                    id: video.channel.id
                }
        })
        } catch (e) {
            console.log(e);
        }
    });
        console.log(`Done downloading ${e} [Custom Search]`)  
        }catch(e) {
            console.log(e);
        }
    })
    const t5 = performance.now();
    console.log(`Downloaded search in ${msTmin(t5 - t4)} milliseconds.`);
    const t3 = performance.now();
    console.log(`Downloaded trending in ${msTmin(t3 - t2)} milliseconds.`);
    if(!indexFile.videos) indexFile.videos = [];
    const allVideos = indexFile.videos.concat(data);
    for (let i = 0; i < allVideos.length; i += 20) {
        index.push(allVideos.slice(i, i + 20));
    }
    getSize('./videos', async (err, size) => {
    index.forEach((e, i) => {
        fs.writeFileSync(`./index/index-${i}.json`, JSON.stringify({
          page: i,
          list: e,
          totalPages: index.length
      }));
    })
    fs.writeFileSync('./videos.json', JSON.stringify({ totalSize: bts(size), totalVideos: allVideos.length, videos: allVideos  }, null, 2));
    const tEnd = performance.now();
    console.log(`Done in ${msTmin(tEnd - t)} milliseconds.`);
    console.log(`Total size of videos: ${bts(size)}`);
    });
})();


function bts(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function msTmin(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};
