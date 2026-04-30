import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
      const { cv, course, courseLabel, salMin, salMax } = await req.json();

          const txt = cv.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500);
              const sal = `SGD ${parseInt(salMin).toLocaleString()} to ${parseInt(salMax).toLocaleString()} per month`;

                  const prompt = `You are a Singapore recruitment consultant. Write a recruiter pitch for a hiring manager.

                  Candidate background: ${txt}
                  Course completed: ${courseLabel} (${course})
                  Salary expectation: ${sal}
                  Profile tags: D2 (SCTP), High Touch candidate

                  Return ONLY this JSON with no markdown:
                  {
                    "subject": "email subject line",
                      "lines": ["line1","line2","line3","line4","line5"]
                      }

                      The pitch should open with a strong hook, highlight how past experience combines with new course skills, mention the SCTP programme, state salary, and end with a call to action.`;

                          const geminiRes = await fetch(
                                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                                      { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
                                                  );
                                                      if (!geminiRes.ok) throw new Error(`Gemini error ${geminiRes.status}: ${await geminiRes.text()}`);
                                                          const geminiData = await geminiRes.json();
                                                              const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
                                                                  const text = rawText.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
                                                                      const data = JSON.parse(text);
                                                                          return NextResponse.json(data);
                                                                            } catch (e: unknown) {
                                                                                console.error('[/api/pitch]', e);
                                                                                    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
                                                                                      }
                                                                                      }