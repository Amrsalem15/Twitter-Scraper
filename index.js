const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const cheerio = require('cheerio');
const request = require('request-promise');

async function scrapeTweets(minutes) {
 
  

  // Replace with the Twitter account URL you want to scrape
  const url = ['https://x.com/Mr_Derivatives',
     'https://x.com/warrior_0719'
     ,'https://x.com/ChartingProdigy'
     ,'https://x.com/allstarcharts'
     ,'https://x.com/yuriymatso'
     ,'https://x.com/TriggerTrades'
     ,'https://x.com/AdamMancini4'
     ,'https://x.com/CordovaTrades'
     ,'https://x.com/Barchart'
     ,'https://x.com/RoyLMattox'

  ]; 
  const counts = new Map(); // Use Map to store counts of each unique symbol
for(let u of url){
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(u, { waitUntil: 'networkidle2' });
  try{
 
    const tweets = await page.evaluate(async () => {
      const tweetTexts = new Set();
      let previousLength = 0;      
      let i=0;
      let max=10;

      while (i<max) {
          // Extract tweets
          const tweetElements = document.querySelectorAll('article');
          tweetElements.forEach(element => {
            const tweetText = element.innerText;
            if (tweetText.includes('$')) { // Check if tweet contains '$'
              tweetTexts.add(tweetText); // Add only tweets with '$' to Set
            }
          });      
          // Check if new tweets have been loaded
          if (tweetElements.length == previousLength) {
            i++;
            
          }
          else{
            i=0;
          }
          previousLength = tweetElements.length;
  
          // Scroll down to load more tweets only if there are tweets
        if (tweetElements.length > 0) {
          const lastTweet = tweetElements[tweetElements.length - 1];
          lastTweet.scrollIntoView();
        } 
          
          // Wait for tweets to load
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log("done");
      
     
  
      return Array.from(tweetTexts); // Convert Set back to Array
  });
 

  for (let tweet of tweets) {
    const matches = tweet.match(/\$[A-Z]{3,5}/g);
    if (matches) {
      for (let match of matches) {
        if (counts.has(match)) {
          counts.set(match, counts.get(match) + 1);
        } else {
          counts.set(match, 1);
        }
      }
    }

  }
  
 

  }
  catch(e){
    console.log(e)
  }
  finally{
    await browser.close();
  }
  

}
for (let [symbol, count] of counts) {
  console.log(symbol,'was mentioned', count ,' times in the last', minutes ,'minutes.');};
 
}


// run the function every interval
const intervalMinutes = 15;

const job = schedule.scheduleJob(`*/${intervalMinutes} * * * *`, () => {
  console.log('Running scheduled scrape');
  scrapeTweets(intervalMinutes);
});
