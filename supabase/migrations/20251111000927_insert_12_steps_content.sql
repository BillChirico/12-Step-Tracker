/*
  # Insert 12 Steps Educational Content

  ## Overview
  This migration populates the steps_content table with comprehensive educational material
  for all 12 steps of Alcoholics Anonymous.

  ## Changes
  - Inserts detailed content for each of the 12 steps
  - Includes titles, descriptions, detailed content, and reflection prompts
  - Content is based on traditional AA step work
*/

-- Insert Step 1
INSERT INTO steps_content (step_number, title, description, detailed_content, reflection_prompts)
VALUES (
  1,
  'We admitted we were powerless over alcohol—that our lives had become unmanageable.',
  'Step One is about accepting the reality of our situation with alcohol and admitting that we need help.',
  'Step One is the foundation of recovery. It requires us to face the truth about our relationship with alcohol and acknowledge that we have lost control. This step is about honesty with ourselves. We recognize that our attempts to control our drinking have failed and that our lives have become chaotic and unmanageable as a result. Powerlessness means that alcohol has power over us, not that we are powerless people. Accepting this truth opens the door to change and allows us to seek help from others and a higher power. This step is often the hardest because it requires letting go of denial and facing painful realities.',
  '["What specific examples show that I was powerless over alcohol?", "In what ways has my life become unmanageable?", "What was I unable to control when it came to drinking?", "How has denial kept me from seeing the truth?", "What am I willing to do differently now?"]'::jsonb
),

-- Insert Step 2
(
  2,
  'Came to believe that a Power greater than ourselves could restore us to sanity.',
  'Step Two is about finding hope and opening ourselves to the possibility of healing through a power greater than ourselves.',
  'Step Two introduces the concept of hope and restoration. After admitting powerlessness in Step One, we now acknowledge that help is available from a source greater than ourselves. This "Power greater than ourselves" can be God as we understand God, the group, nature, or any concept of a loving, caring force. The key is recognizing that we cannot recover alone through willpower. "Restore us to sanity" refers to the insane thinking and behavior patterns that characterized our drinking. We acted against our own best interests repeatedly. This step asks us to be open-minded and willing to believe that healing is possible, even if we don''t fully understand how.',
  '["What does a Higher Power mean to me?", "What evidence do I have that a power greater than myself could help me?", "In what ways was my behavior insane when I was drinking?", "What gives me hope for recovery?", "Am I willing to be open to new ideas about spirituality?"]'::jsonb
),

-- Insert Step 3
(
  3,
  'Made a decision to turn our will and our lives over to the care of God as we understood Him.',
  'Step Three is about making a conscious decision to trust and let go, allowing a Higher Power to guide our lives.',
  'Step Three is the decision step. After recognizing our powerlessness (Step 1) and coming to believe help is available (Step 2), we now make a conscious choice to turn our lives over to the care of a Higher Power. This is not about religious dogma but about trust and surrender. "Turning it over" means releasing our need to control everything and trusting that a loving Higher Power will guide us. This includes our will (thoughts, decisions) and our lives (actions, circumstances). The phrase "as we understood Him" emphasizes that this is a personal understanding, not imposed by others. This step requires courage because it means letting go of self-will, which has often led us astray.',
  '["What does it mean to me to turn my will and life over?", "What am I afraid of losing if I surrender control?", "How has self-will caused problems in my life?", "What would change if I truly trusted a Higher Power?", "Am I ready to make this decision?"]'::jsonb
),

-- Insert Step 4
(
  4,
  'Made a searching and fearless moral inventory of ourselves.',
  'Step Four involves taking an honest look at ourselves, examining our behaviors, character defects, and the harm we have caused.',
  'Step Four is the inventory step. This is a written process where we examine our entire lives with rigorous honesty. We look at our resentments, fears, harms to others, and our part in these situations. A moral inventory is like a business inventory—we take stock of what we have. We examine both our defects (selfishness, dishonesty, fear, inconsiderate behavior) and our assets. The inventory should be "searching" (thorough) and "fearless" (honest, without holding back). This is not about blame or shame; it''s about understanding patterns that have kept us sick. We typically write about people we resent, why we resent them, how it affected us, and our part in the situation. This step helps us see ourselves clearly, often for the first time.',
  '["What resentments have I been holding onto?", "What fears have controlled my decisions?", "What harm have I caused to others?", "What character defects keep appearing in my inventory?", "What strengths and positive qualities do I have?"]'::jsonb
),

-- Insert Step 5
(
  5,
  'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.',
  'Step Five is about sharing our inventory with another person, releasing shame and secrets through honest disclosure.',
  'Step Five is the confession step. After writing our inventory in Step 4, we now share it with God (our Higher Power), ourselves, and another trusted person—usually a sponsor. This step breaks the power of secrets and shame. When we speak our wrongs out loud to another person, we often gain new insights and perspective. The listener helps us see patterns we might have missed and offers acceptance despite our mistakes. "The exact nature of our wrongs" means we don''t just list what we did, but examine why we did it—the character defects and fears that drove our behavior. This step is incredibly freeing. Many people report feeling lighter, cleaner, and more honest after completing their Fifth Step. It builds intimacy with others and with our Higher Power.',
  '["What am I most afraid to share in my Fifth Step?", "What patterns do I notice in my Fourth Step inventory?", "How has keeping secrets affected my life?", "Who would be a good person to hear my Fifth Step?", "What do I hope to gain from this step?"]'::jsonb
),

-- Insert Step 6
(
  6,
  'Were entirely ready to have God remove all these defects of character.',
  'Step Six is about willingness—becoming ready to let go of the character defects that have caused problems in our lives.',
  'Step Six is the willingness step. After identifying our character defects in Steps 4 and 5, we now prepare to release them. This step asks if we are "entirely ready" to have these defects removed. Many of us have mixed feelings—we know these defects hurt us, but they have also served us in some way (protecting us from hurt, giving us control, etc.). Step 6 is about becoming willing to change, even when it feels uncomfortable. We don''t remove the defects ourselves—that''s the job of our Higher Power. Our job is to become ready and willing. This often involves time, prayer, and meditation. We examine why we might want to hold onto certain defects. Perfect readiness isn''t required, but willingness is essential. This step prepares us for the action of Step 7.',
  '["Which character defects am I most ready to release?", "Which defects am I reluctant to let go of, and why?", "How have my defects protected me or served me?", "What would my life look like without these defects?", "Am I willing to become willing?"]'::jsonb
),

-- Insert Step 7
(
  7,
  'Humbly asked Him to remove our shortcomings.',
  'Step Seven is about humility and asking our Higher Power to remove the defects we have identified and become willing to release.',
  'Step Seven is the action step where we humbly ask our Higher Power to remove our shortcomings. The key word is "humbly"—this means having a realistic view of ourselves, neither inflated nor deflated. We acknowledge that we cannot remove these defects through willpower alone; we need help. This step is a prayer, a request for change. We ask our Higher Power to remove specific shortcomings and to help us develop their opposite virtues (courage to replace fear, honesty to replace dishonesty, etc.). This is not a one-time event but an ongoing practice. We may need to ask repeatedly, and we must be willing to take action when opportunities arise to practice new behaviors. The removal of defects is often gradual, not instantaneous. We learn to watch for these defects in our daily lives and ask for help in the moment.',
  '["What specific shortcomings do I want removed?", "How will I practice humility in asking for help?", "What virtues do I want to develop in place of my defects?", "Am I willing to take action when opportunities to change arise?", "How will I know when my character is changing?"]'::jsonb
),

-- Insert Step 8
(
  8,
  'Made a list of all persons we had harmed, and became willing to make amends to them all.',
  'Step Eight is about identifying everyone we have hurt and cultivating the willingness to repair those relationships.',
  'Step Eight is the preparation step for making amends. We make a list of every person we have harmed through our drinking and behavior. This includes family, friends, employers, strangers, and ourselves. We examine how we hurt these people (financially, emotionally, physically, spiritually). The second part of this step is becoming willing to make amends to all of them—even those we dislike or who have hurt us. Willingness is crucial. We may want to skip certain people or make excuses, but this step asks for complete willingness. We don''t make the amends yet; we just prepare our hearts and minds. Some amends will be easy, others terrifying. We talk with our sponsor about each person on our list. This step builds on the self-knowledge gained in earlier steps and sets the stage for healing relationships.',
  '["Who have I harmed through my drinking and behavior?", "What specific harms did I cause to each person?", "Which amends am I most resistant to making, and why?", "Am I willing to make amends even to people I don''t like?", "How has my unwillingness to make amends kept me stuck?"]'::jsonb
),

-- Insert Step 9
(
  9,
  'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
  'Step Nine is about taking action to repair the harm we have caused, making direct amends wherever possible and safe.',
  'Step Nine is the amends step. We now take action on the list we created in Step 8. "Direct amends" means face-to-face whenever possible, admitting our wrongdoing and offering to make things right. This might involve repaying money, apologizing sincerely, or changing our behavior. We make amends to repair the harm we caused, not to make ourselves feel better. The exception clause is important: we don''t make amends if doing so would cause more harm to the person or others. For example, we wouldn''t confess an affair if it would devastate a spouse who has moved on. We discuss each amend with our sponsor to ensure we''re not being selfish or causing more harm. Some amends are living amends—changed behavior over time. This step requires courage and humility. The results are often miraculous: relationships heal, guilt lifts, and we become responsible people.',
  '["Which amends can I make right away?", "Which amends might cause more harm and should not be made?", "What do I need to say in each amends?", "How will I handle it if someone rejects my amends?", "What living amends do I need to make through changed behavior?"]'::jsonb
),

-- Insert Step 10
(
  10,
  'Continued to take personal inventory and when we were wrong promptly admitted it.',
  'Step Ten is about maintaining our recovery through daily self-examination and quickly correcting our mistakes.',
  'Step Ten is the maintenance step. It asks us to continue the inventory process from Step 4 on a daily basis. We watch for selfishness, dishonesty, resentment, and fear. When these arise, we ask our Higher Power to remove them and quickly make amends if we have harmed someone. "Promptly admitted it" means we don''t let wrongs pile up; we address them quickly. This keeps us clean and current in our relationships. Many people do a nightly inventory, reviewing their day and noting where they were right or wrong. When wrong, we admit it quickly—to ourselves, our Higher Power, and the person we harmed. When right, we gratefully acknowledge it without pride. This step keeps us in fit spiritual condition and prevents the buildup of resentments and guilt that could lead to relapse. It''s a tool for daily living.',
  '["What method will I use for my daily inventory?", "Where was I selfish, dishonest, resentful, or afraid today?", "What amends do I need to make from today?", "What did I do well today?", "How can I do better tomorrow?"]'::jsonb
),

-- Insert Step 11
(
  11,
  'Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out.',
  'Step Eleven is about deepening our spiritual life through prayer and meditation, seeking guidance and strength from our Higher Power.',
  'Step Eleven is the spiritual step. It asks us to develop a daily practice of prayer (talking to our Higher Power) and meditation (listening to our Higher Power). The goal is to improve our "conscious contact"—our awareness of and connection to our Higher Power throughout the day. We pray for knowledge of our Higher Power''s will for us (what we should do) and the power to carry it out (the strength to do it). This is not about praying for things we want, but about aligning our will with our Higher Power''s will. Many people have a morning practice of meditation, prayer, and reading, and an evening practice of inventory and gratitude. This step provides the spiritual fuel for our daily lives. Regular practice brings peace, clarity, and guidance. We learn to pause during the day and ask for help or direction.',
  '["What does prayer mean to me?", "What does meditation mean to me?", "What is my current spiritual practice?", "How can I improve my conscious contact with my Higher Power?", "What is my Higher Power''s will for me today?"]'::jsonb
),

-- Insert Step 12
(
  12,
  'Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs.',
  'Step Twelve is about service—sharing our recovery with others and living according to spiritual principles in all areas of life.',
  'Step Twelve is the service step. It has three parts. First, we acknowledge that we have had a "spiritual awakening"—a profound change in our lives through working the steps. This awakening might be sudden or gradual, but it represents a fundamental shift in how we see ourselves, others, and our Higher Power. Second, we "carry this message to alcoholics"—we share our experience, strength, and hope with others who are still suffering. This might mean sponsoring others, speaking at meetings, or simply being available to help. Service keeps us sober and gives our lives meaning. Third, we "practice these principles in all our affairs"—we apply honesty, humility, acceptance, service, and other spiritual principles to every area of life: work, family, finances, relationships. Step 12 is not the end but the beginning of a new way of living. Recovery is an ongoing process of growth.',
  '["What spiritual awakening have I experienced?", "How has my life changed through working the steps?", "How can I carry the message to others who are suffering?", "What spiritual principles have I learned?", "How can I practice these principles in all my affairs?"]'::jsonb
)
ON CONFLICT (step_number) DO NOTHING;
