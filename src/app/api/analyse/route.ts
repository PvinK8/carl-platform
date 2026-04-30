import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
      const { cv, course, salMin, salMax, courseSkills } = await req.json();

          const txt = cv.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500);
              const sal = `SGD ${parseInt(salMin).toLocaleString()} to ${parseInt(salMax).toLocaleString()} per month`;

                  const prompt = `You are a Singapore recruitment expert. Analyse this candidate CV and return ONLY valid JSON with no markdown.

                  CV: ${txt}

                  Course completed: ${course}
                  Course skills: ${courseSkills}
                  Salary expectation: ${sal}

                  Return this exact JSON:
                  {
                    "name": "candidate full name",
                      "headline": "one line professional summary",
                        "experience_years": 0,
                          "top_skills": ["skill1","skill2","skill3","skill4","skill5","skill6"],
                            "domain": "primary domain e.g. HR Finance Healthcare Logistics Marketing IT",
                              "course_fit": "how course connects to background in 1-2 sentences",
                                "best_roles": ["role1","role2","role3"],
                                  "salary_verdict": "realistic or stretch or conservative",
                                    "counsellor_note": "one key insight for the talent specialist"
                                    }`;

                                        const geminiRes = await fetch(
                                              `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                                                    { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
                                                                );
                                                                    if (!geminiRes.ok) throw new Error(`Gemini error ${geminiRes.status}: ${await geminiRes.text()}`);
                                                                        const geminiData = await geminiRes.json();
                                                                            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
                                                                                const cleaned = rawText.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
                                                                                    const parsed = JSON.parse(cleaned);
                                                                                        return NextResponse.json(parsed);
                                                                                          } catch (e: unknown) {
                                                                                              console.error('[/api/analyse]', e);
                                                                                                  return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
                                                                                                    }
                                                                                                    }