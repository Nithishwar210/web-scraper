import puppeteer, { Page } from "puppeteer";
import { WebScrapModelInstance } from "../models/webScrap.model";
import { TagType } from "../utils/enum.util";

interface TagInfo {

  name: string;
  questions: number;
  detail?: any[]
  url?: string | null
  isProgrammingLanguage?: boolean
}

interface QuestionInfo {
  title: string;
  link?: string;
  tag_id?: number,
  votes?: string;
  answers?: string;
  views?: string;
  detail?: string[];
  user?: string;
  reputation?: string;
  time?: string;
}

export class WebScrap {

  page: Promise<Page>
  programmingLanguages: string[] = [
    "javascript", "python", "java", "c#", "php", "c++", "typescript",
    "ruby", "swift", "objective-c", "kotlin", "go", "rust", "scala",
    "perl", "haskell", "lua", "dart", "elixir", "clojure", "matlab",
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "c"
  ];

  async getPopularLanguage() {
    const page = await this.getPage();
    const tags = await this.extractTags(page);
    console.log({ tags });

    // tags.length
    for (let i = 0; i < tags.length; i++) {

      const tag = tags[i];
      console.log({ tag });

      const tagInsert = await WebScrapModelInstance.insertTag({
        name: tag.name,
        type: tag.isProgrammingLanguage ? TagType.ProgrammingLanguage : TagType.Other,
        questions: +tag.questions
      });

      const tagId = tagInsert?.rows[0]?.id

      if (tagId) {

        await this.extractTagDetails(page, tags[i], tagId)

        if (tag.detail && tag.detail?.length > 0) {

         const insertQuestions =  tag.detail.map(question => ({
            ...question,
            tag_id: tagId
          }));

         await WebScrapModelInstance.insertQuestion(insertQuestions);

        }

      };

    }

    return tags;
  }

  async getPage(): Promise<Page> {
    if (this.page) return this.page;

    const browser = await puppeteer.launch({
      headless: false,
    });

    this.page = browser.newPage();
    return this.page;
  }

  async extractTags(page: Page): Promise<TagInfo[]> {

    const googleUrl = 'https://stackoverflow.com/tags?tab=popular';

    await page.goto(googleUrl);

    const tags = await page.evaluate(() => {
      const tagElements = document.querySelectorAll('.grid--item');
      const tagInfo: TagInfo[] = [];

      tagElements.forEach((tagElement) => {
        const nameElement = tagElement.querySelector('.post-tag');
        const questionElement = tagElement.querySelector('.mt-auto .flex--item');
        const name = nameElement?.textContent?.trim() || 'N/A';
        const questions = questionElement?.textContent?.trim().split(' ')[0] || 'N/A';

        tagInfo.push({ name, questions: +questions });
      });

      return tagInfo;
    });

    return tags.map(tag => ({
      ...tag,
      isProgrammingLanguage: this.programmingLanguages.includes(tag.name.toLowerCase())
    }));
  }

  async extractTagDetails(page: Page, tag: TagInfo, tag_id: number) {

    console.log("inside tag_id", tag_id);

    for (let i = 0; i < 10; i++) {

      const tagUrl = `https://stackoverflow.com/questions/tagged/${tag.name}?page=${i + 1}&pagesize=50`;

      await page.goto(tagUrl, { waitUntil: 'networkidle2' });

      const tagDetail = await page.evaluate(() => {
        const questionElements = document.querySelectorAll('.js-post-summary');
        const questionInfo: QuestionInfo[] = [];

        questionElements.forEach((questionElement) => {

          const titleElement = questionElement.querySelector('.s-post-summary--content-title a');
          const voteElement = questionElement.querySelector('.s-post-summary--stats-item__emphasized .s-post-summary--stats-item-number');
          const viewElement = questionElement.querySelector('.s-post-summary--stats-item:nth-child(3) .s-post-summary--stats-item-number');
          const tagElements = questionElement.querySelectorAll('.js-post-tag-list-item .post-tag');

          const title = titleElement?.textContent?.trim() || 'N/A';
          const votes = voteElement?.textContent?.trim() || '0';
          const views = viewElement?.textContent?.trim() || '0';
          const tags = Array.from(tagElements).map(tag => tag.textContent?.trim() || 'N/A');

          questionInfo.push({ title: `${title}`, votes, views, detail: tags });

        });


        return questionInfo
      });

      if (tag.detail) {
        tag.detail.push(...tagDetail);
      } else {
        tag.detail = tagDetail;
      }
    }
  }
}
