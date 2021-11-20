const rp = require('request-promise');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');


const tgToken = '';
const tgChatID = [
];
const bot = new TelegramBot(tgToken, {polling: true});
const url = 'https://www.olx.ua/nedvizhimost/kvartiry/dolgosrochnaya-arenda-kvartir/2-komnaty/dnepr/?search%5Bfilter_float_price%3Ato%5D=9000&search%5Bprivate_business%5D=private';

var oldPostsID = [];

bot.on('message', (msg) => {
	const chatId = msg.chat.id;
	if (!tgChatID.includes(chatId)) {
		tgChatID.push(chatId)
		bot.sendMessage(chatId, 'Подписка установлена :)');
	} else {
		bot.sendMessage(chatId, 'Уже подписан(а).');
	}

	// send a message to the chat acknowledging receipt of their message
});

function getAllPosts(offersTable, $){
	return $(offersTable).find('tbody > .wrap');
}

function getAllPostsID(offersTable, $){
	var IDs = [],
		posts = getAllPosts(offersTable, $);

		posts.each(function(i, offer){
			IDs.push( $(offer).find('table.fixed').attr('data-id') );
		})
		return IDs;
}

function getAllNewPosts(offersTable, $){

	var offers = getAllPosts(offersTable, $);
		newOffers = [];

		offers.each(function(i, offer){
			var offerID = $(offer).find('table.fixed').attr('data-id');

			if ( ! oldPostsID.includes(offerID) ) {
				newOffers.push(offer);
				oldPostsID.push(offerID);
			}
		});

		return newOffers;
}

function getParsedPost(post, $){
	var post = $(post),
		link = post.find('.photo-cell > a').attr('href'),
		price = post.find('.price > strong').text(),
		title = post.find('.detailsLink > strong').text(),

		message = title + '\n' + price + '\n' + link;

		return message;
}

function parse() {
	rp(url)
  .then(function(html){
	//success!
	const $ = cheerio.load(html);
	var offersTable = $('#offers_table');

	if( oldPostsID.length == 0 ) {
        oldPostsID = getAllPostsID(offersTable, $);
	}

	var posts = getAllNewPosts(offersTable, $);

    if( posts.length != 0 ){
        posts.forEach(post => {
            var message = getParsedPost(post, $);
			tgChatID.forEach(id => {
				console.log(oldPostsID, id);
				bot.sendMessage(id, message);
			});
        });
    }
    console.log("ok")

  })
  .catch(function(err){
    //handle error
  });
}

setInterval(parse, 60000);