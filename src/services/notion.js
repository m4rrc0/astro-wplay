const NOTION_URL = import.meta.env.NOTION_URL || process.env.NOTION_URL;
const NOTION_API = import.meta.env.NOTION_SECRET || process.env.NOTION_SECRET;
// The things I need for my request
const axios = require('axios');
const { Client } = require("@notionhq/client");
const notion = new Client({auth:NOTION_API});

async function loadNotionPage() {
    await axios.get(NOTION_URL)
    .then((page) =>{
        console.log(page);//for debug
    })
    .catch((error)=>{
        console.log(error);
    })
    
}

loadNotionPage()