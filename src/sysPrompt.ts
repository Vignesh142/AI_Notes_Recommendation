import { NoteMetadata } from './noteGenerator.js';

export const getRoadmapPrompt = (content: string) => {

    const prompt = `
        You are an expert educational content creator. Your task is to create comprehensive, well-structured notes based on the syllabus or course content provided below.

        SYLLABUS:
        -------------------------------
        ${content}.
        -------------------------------

        the roadmap should be comprehensive from basic to advanced.
        
        Output Structure:

        {
            "roadmapjson": "...json code of roadmap"
        }

        Output format:
        {
            "roadmapjson": { // json format to generate further brief notes of sub-topics.
                "phase1": {
                "title": "Planning",
                "description": "Initial research and planning of the web application",
                "subPhases": {
                    "subPhase1": {
                    "title": "Define requirements",
                    "description": "Gather all necessary information to understand project goals."
                    },
                    "subPhase2": {
                    "title": "Research technologies",
                    "description": "Choose the right stack and tools for development."
                    }
                }
                },
                "phase2": {
                "title": "Development",
                "description": "Develop the web application using React and Node.js",
                "subPhases": {
                    "subPhase1": {
                    "title": "Set up React project",
                    "description": "Initialize a new React project with necessary configurations."
                    },
                    "subPhase2": {
                    "title": "Set up Node.js server",
                    "description": "Create a Node.js server to handle backend logic."
                    }
                }
                }
            }
        }


        NOTE: **make sure u only return json object and nothing before or after.**
        NOTE: **the Roadmap should be comprehensive and beginner to advanced.**
        NOTE: **Divide the Entire portion in to several phases!! strictly. [as many as possible, minimum: 10, maximum:20, nesting can be upto 5 levels]**


        Now generate the roadmap for the above SYLLABUS.
        `;

    return prompt;
}