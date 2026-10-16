# Command Dashboard — v0.1 view model

This isolated prototype consumes the actual simulated mission engine and approval gate rather than showing invented static metrics. Run with Node 22:

```bash
node prototype/dashboard-demo.mjs
node --test prototype/*.test.mjs
```

The resulting JSON has `mode: SIMULATION_ONLY` and contains:
- mission status, tasks and individual agent outputs
- pending approval summaries (not approval execution controls)
- event evidence, ledger verification state
- actual simulated counts: completed agents, pending approvals, external actions (always zero)

A live UI and API must only be introduced after authenticated tenant context, persistent event storage and backend approval authorization exist. The mode flag must stay prominent. No customer data is loaded. The current view model is a backend-friendly interface contract, **not** a deployed graphical dashboard.
