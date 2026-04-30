# Personal Notes — BMAD Development Experience

## PRD Creation

The PRD workflow asked detailed questions about every aspect of the project — the domain, personas, innovation ideas, what makes the product unique. It covered both functional and non-functional requirements thoroughly. The level of detail was impressive; the questions went much deeper than I would have thought to ask on my own.

## UX Design

The UX workflow surprised me with how specific the questions were — not just about layout, but about how the design should *feel*. I definitely couldn't have written a prompt this comprehensive myself. I was also surprised that it proposed a complete color palette and font system right away, without me needing to guide it. It even asked detailed questions about keyboard shortcuts and interaction patterns.

## Architecture

The architecture document was comprehensive — patterns, anti-patterns, error handling approaches, technology choices. One thing I really appreciated is that the process is incremental. The app isn't held hostage in a single context session; I can work through it step by step across multiple conversations.

## Planning Artifacts & Readiness Check

The planning phase produced all artifacts automatically. The implementation readiness check was a nice touch — the system validates its own output before handing off to development. Good to see that kind of self-verification built in.

## Implementation

The implementation of individual tasks was thorough but sometimes slow. At one point, the system started implementing the next ticket instead of running the code review — it's better to invoke the BMAD commands explicitly rather than relying on the agent to choose the right next step.

It also happened that after completing a story, the review step was skipped and it jumped straight to implementing the next one. Calling the specific `/bmad-*` command directly is more reliable.

One practical tip: it pays off to implement at least a full epic within a single terminal session. Switching sessions means waiting for the full context to reload, which adds overhead.

After a few hours of continuous work, I hit my usage limit on the max Claude Code account. Something to keep in mind for longer sessions.

## Open Question

I'm curious how the BMAD framework would scale to much larger and more complex applications. How many epics and stories would it generate? Would the incremental approach still hold up, or would context management become a bottleneck?
