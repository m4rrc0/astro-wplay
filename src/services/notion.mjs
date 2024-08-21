import{ Client } from "@notionhq/client";

const NOTION_URL = import.meta.env?.NOTION_URL || process.env.NOTION_URL;
const NOTION_API = import.meta.env?.NOTION_SECRET || process.env.NOTION_SECRET;

const notion = new Client({auth:NOTION_API});

/* test = variable for running script in astro (via path page) or via terminal : node -e 'import("./src/services/notion.mjs").then( loadedModule => loadedModule.test() )' --env
-file=.env) */

export  const test = async ()=>{
    const blockID_PageWebcontent = "5122aa2572f8476396089cf852c14847";
    const response = await notion.blocks.children.list({
        block_id: blockID_PageWebcontent,
        page_size:50,
    })
    console.log(response.results);

    console.log(response.results[2].child_page);
    
};

export const testPage = async ()=>{
    const pageID_TeamPage= "78381d9787f5487d9184dd4ffe4af72b";
    const response = await notion.pages.retrieve({page_id: pageID_TeamPage});

    console.log(response);
    
};

// [0].paragraph