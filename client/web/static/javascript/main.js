//==================== util =====================//
let pt = ''
function debounce(idle, action) {
    var last;
    return function () {
        var ctx = this, args = arguments;
        clearTimeout(last);
        last = setTimeout(function () {
            action.apply(ctx, args);
        }, idle);
    };
};

function decodeUnicode(str) {
    return str.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
        return String.fromCharCode(parseInt(match.replace(/\\u/, ''), 16));
    });
}

//==================== render =====================//

function renderSearchResult(result) {
    var result = JSON.parse(result)
    var wordsHtml = result.words.map(renderWord).join('');
    if (wordsHtml === '')
        wordsHtml = '<p class="no-result">抱歉，没有找到相关的内容</p>';
    else if (result.more)
        wordsHtml += '<div id="readmore-container"><button id="readmore-button">查看更多</button></div>';
    return wordsHtml;
}

function renderWord(word) {
    var playButton;
    if (word.has_audio) {
        playButton = '<button class="result-play-button" data-url="' + word.us_audio.replace(/^http/, 'http') + '"><img src="./static/img/play.png"></button>';
    } else {
        playButton = '<span class="result-no-play">暂无发音</span>';
    }
    let sep = pt.replace(/\*/g, '')
    let seps = word.word.split(sep)
    seps.pop()
    let s = seps.join('')
    word.word = s + '.' + sep
    var wordLiteral = '<span class="result-word">' + word.word + '</span>';
    var wordPron = '<span class="result-pron">/ ' + decodeUnicode(word.us_pron) + ' /</span>';
    var wordDefinition = '<span class="result-definition">' + decodeUnicode(word.definition) + '</span>';
    return '<div class="result-item">' + wordLiteral + wordPron + playButton + wordDefinition + '</div>';
}

//==================== action =====================//

function play(url) {
    var audio = $('#audio');
    audio.attr('src', url);
    audio.get(0).play();
}

function insertStr(source, start, newStr) {
    return source.slice(0, start) + newStr + source.slice(start);
}

function search(pattern) {
    pt = pattern
    $.get('http://api.nestattacked.com/regdict/v1/words?pattern=' + pattern, function (result) {
        // console.log(result)
        // let sep = pattern.replace(/\*/g, '')
        // let obj = JSON.parse(result)
        // obj.words.map(val => {
        //     let seps = val.word.split(sep)
        //     seps.pop()
        //     let s = seps.join('')
        //     val.word = s + '.' + sep
        //     // console.log(val)
        //     return val
        // })
        // let results = JSON.stringify(obj)
        // console.log(results)
        // console.log(JSON.parse(result))
        var wordsHtml = renderSearchResult(result);
        $('#results').html(wordsHtml);
        $('#examples').hide();
        $('#results').show();
    });
}

function showHelp() {
    $('#results').hide();
    $('#examples').show();
}

function readMore() {
    var count = $('.result-item').length;
    var pattern = $('#search-input').val();
    $.get('http://api.nestattacked.com/regdict/v1/words?limit=10&pattern=' + pattern + '&offset=' + count, function (result) {
        var result = JSON.parse(result);
        var wordsHtml = result.words.map(renderWord).join('');
        wordsHtml += (result.more ? '<div id="readmore-container"><button id="readmore-button">查看更多</button></div>' : '');
        $('#readmore-container').remove();
        $('#results').append(wordsHtml);
    });
}

function focus() {
    $('#search-input').focus();
}

//==================== initilize =====================//

var debouncedSearch = debounce(200, search);

$('#search-input').keyup(function () {
    debouncedSearch($(this).val());
});

$('#results').on('click', '.result-play-button', function () {
    play($(this).attr('data-url'));
});

$('#help-button').click(showHelp);
$('body').on('click', '#readmore-button', readMore);
$(document).ready(focus);
