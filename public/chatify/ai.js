window.addEventListener("load", async function () {
  class Html {
    constructor(e) {
      this.elm = document.createElement(e || "div");
    }
    text(val) {
      this.elm.innerText = val;
      return this;
    }
    html(val) {
      this.elm.innerHTML = val;
      return this;
    }
    cleanup() {
      this.elm.remove();
    }
    query(selector) {
      return this.elm.querySelector(selector);
    }
    class(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.toggle(val);
      }
      return this;
    }
    classOn(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.add(val);
      }
      return this;
    }
    classOff(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.remove(val);
      }
      return this;
    }
    style(obj) {
      for (const key of Object.keys(obj)) {
        this.elm.style.setProperty(key, obj[key]);
      }
      return this;
    }
    on(ev, cb) {
      this.elm.addEventListener(ev, cb);
      return this;
    }
    un(ev, cb) {
      this.elm.removeEventListener(ev, cb);
      return this;
    }
    appendTo(parent) {
      if (parent instanceof HTMLElement) {
        parent.appendChild(this.elm);
      } else if (parent instanceof Html) {
        parent.elm.appendChild(this.elm);
      } else if (typeof parent === "string") {
        document.querySelector(parent).appendChild(this.elm);
      }
      return this;
    }
    append(elem) {
      if (elem instanceof HTMLElement) {
        this.elm.appendChild(elem);
      } else if (elem instanceof Html) {
        this.elm.appendChild(elem.elm);
      } else if (typeof elem === "string") {
        const newElem = document.createElement(elem);
        this.elm.appendChild(newElem);
        return new Html(newElem);
      }
      return this;
    }
    appendMany(...elements) {
      for (const elem of elements) {
        this.append(elem);
      }
      return this;
    }
    clear() {
      this.elm.innerHTML = "";
      return this;
    }
    attr(obj) {
      for (let key in obj) {
        this.elm.setAttribute(key, obj[key]);
      }
      return this;
    }
  }
  class Modal {
    constructor(content) {
      this.modal = new Html("div");
      this.modal.class("modal");
      this.modal.attr({ "aria-modal": "true", role: "dialog" });

      this.content = new Html("div");
      this.content.class("modal-content");
      this.content.appendTo(this.modal);

      if (typeof content === "string") {
        this.content.html(content);
      } else if (content instanceof HTMLElement) {
        this.content.append(content);
      } else if (content instanceof Html) {
        this.content.append(content.elm);
      }

      this.closeBtn = new Html("button");
      this.closeBtn.class("close-btn");
      this.closeBtn.class("transparent");
      this.closeBtn.text("x");
      this.closeBtn.attr({ type: "button" });
      this.closeBtn.on("click", this.hide.bind(this));
      this.closeBtn.appendTo(this.content);

      this.overlay = new Html("div");
      this.overlay.class("modal-overlay");
      this.overlay.appendTo(this.modal);

      this.modal.on("keydown", (e) => {
        this.handleKeyDown(e);
      });

      const focusableElements = this.content.elm.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="checkbox"], input[type="radio"], select'
      );
      this.elementsArray = Array.prototype.slice.call(focusableElements);
      this.elementsArray.forEach((el) => {
        el.setAttribute("tabindex", "0");
      });

      this.elementsArray[0].addEventListener("keydown", (e) => {
        if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          this.elementsArray[this.elementsArray.length - 1].focus();
        }
      });
      this.elementsArray[this.elementsArray.length - 1].addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            this.elementsArray[0].focus();
          }
        }
      );
      this.elementsArray[0].focus();
    }

    show() {
      this.modal.appendTo("body");
      this.modal.elm.focus();
      this.elementsArray[0].focus();
    }

    hide() {
      this.modal.cleanup();
    }

    handleKeyDown(e) {
      if (e.key === "Escape") {
        this.hide();
      }
    }
  }

  function toSnakeCase(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function saveAssistant(id, obj) {
    let prompts = {};
    try {
      prompts = JSON.parse(localStorage.getItem("prompts")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    prompts[id] = obj;
    localStorage.setItem("prompts", JSON.stringify(prompts));
  }
  function loadAssistant(id = null) {
    let prompts = {};
    try {
      prompts = JSON.parse(localStorage.getItem("prompts")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    if (id === null) {
      return prompts;
    } else {
      return prompts[id];
    }
  }
  function deleteAssistant(id) {
    let prompts = {};
    try {
      prompts = JSON.parse(localStorage.getItem("prompts")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    delete prompts[id];
    localStorage.setItem("prompts", JSON.stringify(prompts));
  }

  function saveConvo(id, obj) {
    let convos = {};
    try {
      convos = JSON.parse(localStorage.getItem("convos")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    convos[id] = obj;
    localStorage.setItem("convos", JSON.stringify(convos));
  }
  function loadConvo(id = null) {
    let convos = {};
    try {
      convos = JSON.parse(localStorage.getItem("convos")) || {};
    } catch (e) {
      alert("Error parsing convos from localStorage!");
    }
    if (id === null) {
      return convos;
    } else {
      return convos[id];
    }
  }
  function deleteConvo(id) {
    let convos = {};
    try {
      convos = JSON.parse(localStorage.getItem("convos")) || {};
    } catch (e) {
      alert("Error parsing convos from localStorage!");
    }
    delete convos[id];
    localStorage.setItem("convos", JSON.stringify(convos));
  }

  function importAndLoadPrompt(value, cb) {
    try {
      const r = JSON.parse(value);
      if (r.system && r.temp) {
        if (r.name === undefined) r.name = false;
        if (r.avatar === undefined) r.avatar = false;
        customSettings_systemPrompt.elm.value = r.system;
        customSettings_temp.elm.value = r.temp;
        aiNameOverride = r.name;
        aiAvatarOverride = r.avatar;
        customSettings_overrideName.elm.value = aiNameOverride;
        customSettings_overrideAvatar.elm.value = aiAvatarOverride;
        cb();
      } else {
        cb();
        const btn_modalContent = new Html("div").text(
          'Something may be wrong with the prompt, please make sure it is a valid JSON object with "system" and "temp".'
        );

        const btn_modal = new Modal(btn_modalContent);
        btn_modal.show();
      }
    } catch (e) {
      cb();
      const btn_modalContent = new Html("div").html(
        "Failed to load prompt. Please make sure it is a valid JSON string!<br>Error code: " +
          e
      );

      const btn_modal = new Modal(btn_modalContent);
      btn_modal.show();
    }
  }

  const ICONS = {
    trashCan:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    chevron:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    checkMark:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  };

  let apiUsage = {
    used: 0,
    remaining: 0,
    total: 0,
    expires: "",
    plan: "free",
  };

  async function checkRequests() {
    await this.fetch("/api/usage")
      .then((j) => j.json())
      .then((j) => {
        apiUsage = j;
      });
  }

  await checkRequests();

  const OPENAI_URL = "/api/generateStream";
  // const OPENAI_URL_WS = `${location.protocol.replace("http", "ws")}//${
  //   location.host
  // }/api/generateStream`;
  const OPENAI_URL_WS = `${location.protocol.replace("http", "ws")}//${
    location.host
  }`;
  let messageHistory = [];

  const settingsContainer = new Html().class("config").appendTo("body");
  const messagesWrapper = new Html().class("messages-wrapper");

  const messagesContainer = new Html()
    .class("messages")
    .appendTo(messagesWrapper);
  const inputArea = new Html("textarea")
    .appendTo(messagesWrapper)
    .attr({ type: "text", placeholder: "Message", rows: "1" });

  messagesWrapper.appendTo("body");

  const selectWrapper = new Html().class("row").appendTo(settingsContainer);

  makeMsgSeparator("The conversation begins...");

  function actuallyClearMessageHistory() {
    messageHistory = [];
    messagesContainer.html("");
    makeMsgSeparator("The conversation begins...");
  }

  function clearMessageHistory() {
    if (confirm("Are you sure you want to clear your history?")) {
      actuallyClearMessageHistory();
    }
  }

  const heading = new Html("span")
    .text("Chatify")
    .classOn("extra-hidden")
    .classOn("label")
    .appendTo(selectWrapper);
  const deleteConvoButton = new Html("button")
    .html(ICONS.trashCan)
    .classOn("center")
    .classOn("danger")
    .classOn("fg-auto")
    .appendTo(selectWrapper)
    .on("click", (_) => clearMessageHistory());

  const select = new Html("select")
    .class("fg")
    .class("extra-hidden")
    .appendTo(selectWrapper); //.appendTo(selectWrapper);
  const selectWrapperMiddle = new Html().class("fg").appendTo(selectWrapper);
  const toggleBtn = new Html("button")
    .html(ICONS.chevron)
    .class("fg-auto")
    .classOn("flip-off")
    .appendTo(selectWrapper);

  let menuState = true;

  toggleBtn.on("click", () => {
    if (menuState === true) {
      menuState = false;
      toggleBtn.classOff("flip-off");
      toggleBtn.classOn("flip");
      customSettingsWrapper.classOn("extra-hidden");
      settings_extraContentWrapper.classOn("extra-hidden");
      convoManageButton.classOn("extra-hidden");
      requestUi_wrapper.classOn("extra-hidden");
      heading.classOff("extra-hidden");
      deleteConvoButton.classOn("extra-hidden");
      toggleBtn.style({ "margin-left": "auto" });
      selectPromptBtn.classOn("extra-hidden");
      debugVersionNumber.classOn("extra-hidden");
    } else if (menuState === false) {
      menuState = true;
      toggleBtn.classOff("flip");
      toggleBtn.classOn("flip-off"); // mobile
      customSettingsWrapper.classOff("extra-hidden");
      convoManageButton.classOff("extra-hidden");
      settings_extraContentWrapper.classOff("extra-hidden");
      requestUi_wrapper.classOff("extra-hidden");
      heading.classOn("extra-hidden");
      deleteConvoButton.classOff("extra-hidden");
      toggleBtn.style({ "margin-left": "unset" });
      selectPromptBtn.classOff("extra-hidden");
      debugVersionNumber.classOff("extra-hidden");
    }
  });

  const prompts = await fetch("/api/prompts").then((j) => j.json());

  this.window.prompts = JSON.parse(JSON.stringify(prompts));

  prompts.forEach((e) => {
    select.elm.appendChild(new Option(e.label, e.id));
  });

  select.elm.append(new Option("Custom", "custom"));

  let aiNameOverride = false;
  let aiAvatarOverride = false;

  const customSettingsWrapper = new Html()
    .class("column", "py-0")
    .classOn("hidden")
    .classOn("column")
    .appendTo(settingsContainer);

  const customSettings_systemPrompt = new Html("textarea")
    .appendTo(customSettingsWrapper)
    .attr({ type: "text", placeholder: "System prompt", rows: "4" });
  const customSettings_overrideName = new Html("input")
    .appendTo(customSettingsWrapper)
    .attr({ type: "text", placeholder: "Bot Name Override" })
    .on("input", (e) => {
      aiNameOverride = e.target.value;
    });
  const customSettings_overrideAvatar = new Html("input")
    .appendTo(customSettingsWrapper)
    .attr({
      type: "text",
      placeholder: "Avatar Override, ex. https://...png",
    })
    .on("input", (e) => {
      aiAvatarOverride = e.target.value;
    });

  const customSettings_tempWrapper = new Html("span")
    .classOn("row")
    .classOn("py-0")
    .appendTo(customSettingsWrapper);

  const customSettings_buttonsWrapper = new Html("span")
    .classOn("row")
    .classOn("py-0")
    .appendTo(customSettingsWrapper);

  new Html("button")
    .text("Import")
    .class("fg")
    .appendTo(customSettings_buttonsWrapper)
    .on("click", () => {
      // Take the config from the prompt and impot it ..
      const ta = new Html("textarea").attr({ rows: 8, placeholder: "{ ... }" });

      const modalContent = new Html("div").text("Import JSON data:").append(
        new Html().classOn("column").appendMany(
          ta,
          new Html("button")
            .text("Attempt Import")
            .classOn("fg-auto")
            .on("click", (e) => {
              importAndLoadPrompt(ta.elm.value, () => {
                modal.hide();
              });
            })
        )
      );

      const modal = new Modal(modalContent);
      modal.show();
    });
  new Html("button")
    .text("Export")
    .class("fg")
    .appendTo(customSettings_buttonsWrapper)
    .on("click", () => {
      // Take the config and export it
      const modalContent = new Html("div")
        .text("How do you want to export?")
        .append(
          new Html().classOn("row").appendMany(
            new Html("button")
              .text("JSON Export")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your exported prompt:")
                  .append(
                    new Html("textarea").attr({ rows: 8 }).html(
                      JSON.stringify({
                        system: customSettings_systemPrompt.elm.value,
                        temp: customSettings_temp.elm.value,
                        avatar: aiAvatarOverride,
                        name: aiNameOverride,
                      })
                    )
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              }),
            new Html("button")
              .text("Add to Saved")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();

                const z = loadAssistant();

                const x = aiNameOverride || "prompt-" + z.length;

                const y = toSnakeCase(x);

                if (z[y]) {
                  if (
                    confirm(
                      `Saving this prompt with the same name as "${y}" will forcefully overwrite it.\nAre you sure you want to do this?`
                    ) === true
                  ) {
                    saveAssistant(y, {
                      system: customSettings_systemPrompt.elm.value,
                      temp: customSettings_temp.elm.value,
                      avatar: aiAvatarOverride,
                      name: aiNameOverride,
                    });
                  } else {
                    return;
                  }
                } else {
                  saveAssistant(y, {
                    system: customSettings_systemPrompt.elm.value,
                    temp: customSettings_temp.elm.value,
                    avatar: aiAvatarOverride,
                    name: aiNameOverride,
                  });
                }

                let m = new Html("span").text(
                  "Saved! Open the prompt picker and go to Saved to see your creation."
                );

                let md = new Modal(m);
                md.show();
              })
          )
        );

      const modal = new Modal(modalContent);
      modal.show();
    });

  new Html("label")
    .attr({ for: "temp" })
    .text("Temperature")
    .appendTo(customSettings_tempWrapper);
  const customSettings_temp = new Html("input")
    .attr({ id: "temp", type: "range", min: "0", max: "1", step: "0.01" })
    .appendTo(customSettings_tempWrapper);

  let userName;

  const settings_extraContentWrapper = new Html("span");
  const usernameInput = new Html("input")
    .attr({
      type: "text",
      placeholder: "Username",
      maxlength: "24",
      minlength: "1",
    })
    .on("input", (e) => {
      localStorage.setItem("remembered-name", usernameInput.elm.value);
      let result = /^[a-zA-Z0-9-]{0,24}$/.test(usernameInput.elm.value);
      userName = result === true
        ? usernameInput.elm.value
        : "user";
      if (result === false) return e.target.value = 'User';
    })
    .appendTo(settings_extraContentWrapper);

  usernameInput.elm.value = localStorage.getItem("remembered-name") ?? "User";
  userName = /^[a-zA-Z0-9-]{0,24}$/.test(usernameInput.elm.value)
    ? usernameInput.elm.value
    : "user";

  const settings_enableUserNameWrapper = new Html("span")
    .appendTo(settings_extraContentWrapper)
    .classOn("row");

  const settings_enableUserName = new Html("input")
    .attr({ id: "u", type: "checkbox" })
    .appendTo(settings_enableUserNameWrapper);
  new Html("label")
    .attr({ for: "u" })
    .text("Include username?")
    .appendTo(settings_enableUserNameWrapper);

  const settings_rememberContextWrapper = new Html("span")
    .appendTo(settings_extraContentWrapper)
    .classOn("row")
    .classOn("pt-0");

  const settings_rememberContextCheckbox = new Html("input")
    .attr({ id: "rcc", type: "checkbox" })
    .appendTo(settings_rememberContextWrapper);
  new Html("label")
    .attr({ for: "rcc" })
    .text("Experimental: Remember context better")
    .appendTo(settings_rememberContextWrapper);

  settings_extraContentWrapper.appendTo(settingsContainer);

  function setPrompt(prp) {
    select.elm.value = prp.id;
    selectPromptBtn.text(prp.label);
    if (select.elm.value === "custom") {
      customSettingsWrapper.classOff("hidden");
    } else {
      customSettingsWrapper.classOn("hidden");
    }
  }

  const selectPromptBtn = new Html("button")
    .text("Select prompt..")
    .classOn("transparent")
    .classOn("fg")
    .classOn("w-100")
    .appendTo(selectWrapperMiddle)
    .on("click", () => {
      const tabsButtons = new Html().classOn("row").classOn("fg");
      const tabsGroup = new Html().classOn("fg-max");

      function tabTransition(btn, tab) {
        promptsTab_builtInTab.classOn("extra-hidden");
        promptsTab_communityTab.classOn("extra-hidden");
        promptsTab_savedTab.classOn("extra-hidden");
        promptsTab_builtInButton.classOff("selected");
        promptsTab_communityButton.classOff("selected");
        promptsTab_savedButton.classOff("selected");
        btn.classOn("selected");
        tab.classOff("extra-hidden");
      }

      function setTabContent(tab, prompts) {
        const promptbox = new Html().classOn("prompt-box");

        promptbox.append(
          new Html("button")
            .text("Create your own prompt")
            .classOn("fg-auto")
            .on("click", (e) => {
              setPrompt({ id: "custom", label: "Custom" });
              modal.hide();
            })
        );

        prompts.forEach((prp) => {
          const i = new Html().classOn("prompt").appendMany(
            new Html().classOn("assistant").appendMany(
              new Html()
                .classOn("who")
                .attr({
                  "data-mode": prp.id,
                  style:
                    prp.avatar !== null && prp.avatar !== undefined
                      ? `--icon:url(${prp.avatar})`
                      : "--icon:url(./assets/avatars/builtin/custom.svg)",
                })
                .appendMany(
                  new Html().classOn("icon"),
                  new Html()
                    .classOn("name")
                    .attr({ title: prp.id })
                    .text(prp.label)
                ),
              new Html().classOn("greeting").text(prp.greeting),
              new Html().classOn("hint").text(prp.hint)
            ),
            new Html().classOn("controls").appendMany(
              new Html("button").text("Select").on("click", (e) => {
                if (prp.type !== "saved") {
                  setPrompt(prp);
                  modal.hide();
                } else {
                  setPrompt({ id: "custom", label: "Custom" });
                  const z = JSON.stringify(assistantObj[prp.id]);
                  // console.log(prp, assistantObj, z);
                  importAndLoadPrompt(z, () => {
                    modal.hide();
                  });
                }
              })
            )
          );
          i.appendTo(promptbox);
        });

        tab.append(promptbox);
      }

      const promptsTab_builtInButton = new Html("button")
        .classOn("tab-selector")
        .classOn("fg")
        .text("Built-In")
        .on("click", (e) => {
          tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);
        })
        .appendTo(tabsButtons);

      const promptsTab_builtInTab = new Html("div")
        .classOn("tab")
        .appendTo(tabsGroup)
        .append();

      setTabContent(
        promptsTab_builtInTab,
        prompts.filter((p) => p.type === "builtIn")
      );

      const promptsTab_communityButton = new Html("button")
        .classOn("tab-selector")
        .classOn("fg")
        .text("Community")
        .on("click", (e) => {
          tabTransition(promptsTab_communityButton, promptsTab_communityTab);
        })
        .appendTo(tabsButtons);

      const promptsTab_communityTab = new Html("div")
        .classOn("tab")
        .appendTo(tabsGroup);

      setTabContent(
        promptsTab_communityTab,
        prompts
          .filter((p) => p.type === "community")
          .sort((a, b) => {
            if (a.hint > b.hint) {
              return -1;
            }
            if (a.hint < b.hint) {
              return 1;
            }
            return 0;
          })
      );

      const promptsTab_savedButton = new Html("button")
        .classOn("tab-selector")
        .classOn("fg")
        .text("Saved")
        .on("click", (e) => {
          tabTransition(promptsTab_savedButton, promptsTab_savedTab);
        })
        .appendTo(tabsButtons);

      const promptsTab_savedTab = new Html("div")
        .classOn("tab")
        .appendTo(tabsGroup);
      const assistantObj = loadAssistant();

      setTabContent(
        promptsTab_savedTab,
        Object.keys(assistantObj).map((key) => {
          const p = assistantObj[key];
          return {
            avatar: p.avatar !== false ? p.avatar : null,
            displayName: p.name !== false ? p.name : null,
            greeting: p.system,
            hint: "This is one of your custom prompts.",
            id: key,
            label: p.name !== false ? p.name : null,
            type: "saved",
          };
        })
      );

      const modalContent = new Html("div")
        .class("fg")
        .append(new Html("span").text("Prompt selection"))
        .append(new Html("div").appendMany(tabsButtons).appendMany(tabsGroup));

      tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);

      const modal = new Modal(modalContent);
      modal.show();
    });

  let convoManageButton = new Html("button")
    .text("Conversation...")
    .appendTo(settingsContainer)
    .on("click", () => {
      // Take the config and export it
      const modalContent = new Html("div")
        .text("What do you want to do?")
        .append(
          new Html().classOn("row").appendMany(
            new Html("button")
              .text("Import")
              .classOn("fg-auto")
              .on("click", (e) => {
                // Take the config from the prompt and impot it ..
                const ta = new Html("textarea").attr({
                  rows: 8,
                  placeholder: '[ {"role": ..., "content": ...}, ... ]',
                });
                const modalContent = new Html("div")
                  .text("Import JSON data:")
                  .append(
                    new Html().classOn("column").appendMany(
                      ta,
                      new Html("button")
                        .text("Attempt Import")
                        .classOn("fg-auto")
                        .on("click", (e) => {
                          try {
                            const convo = JSON.parse(ta.elm.value);
                            if (
                              this.confirm(
                                "Are you sure you want to import?\nYou will lose your current conversation if it has not been saved."
                              ) === true
                            ) {
                              md.hide();
                              if (Array.isArray(convo)) {
                                let items = convo.filter((m) => {
                                  if (m !== null && m.content && m.role) {
                                    if (m.role === "assistant") {
                                      if (
                                        m.type === "custom" ||
                                        prompts.find((p) => p.id === m.type) !==
                                          undefined
                                      ) {
                                        return true;
                                      }
                                    } else if (m.role === "user") {
                                      return true;
                                    }
                                    return false;
                                  }
                                });

                                actuallyClearMessageHistory();
                                messageHistory = items;
                                for (let i = 0; i < items.length; i++) {
                                  const item = items[i];
                                  setPrompt(
                                    prompts.find((p) => p.id === item.type) ||
                                      prompts[0]
                                  );

                                  const pickedPrompt =
                                    item.role === "assistant"
                                      ? item.type === "custom"
                                        ? {
                                            label: "Custom (unknown)",
                                            id: "custom",
                                            greeting: "Unset",
                                            hint: "Unset",
                                            type: "builtIn",
                                            avatar:
                                              "./assets/avatars/builtin/custom.svg",
                                            displayName: "Custom (unknown)",
                                          }
                                        : prompts.find(
                                            (p) => p.id === item.type
                                          )
                                      : item.name ?? "User";

                                  let m = makeMessage(
                                    item.role === "user" ? 0 : 1,
                                    "Thinking...",
                                    i,
                                    pickedPrompt
                                  );

                                  if (item.role === "user") {
                                    updateMessage(m.elm, item.content);
                                  } else {
                                    m.query(".data .text").innerHTML =
                                      DOMPurify.sanitize(
                                        marked.parse(item.content)
                                      );
                                  }

                                  // console.log(item, m, i, pickedPrompt);
                                }

                                makeMsgSeparator();
                              }
                            }
                          } catch {
                            md.hide();
                          }
                        })
                    )
                  );

                modal.hide();
                let md = new Modal(modalContent);
                md.show();
              }),
            new Html("button")
              .text("Export")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your conversation:")
                  .append(
                    new Html("textarea")
                      .attr({ rows: 8 })
                      .html(
                        JSON.stringify(messageHistory.filter((m) => m !== null))
                      )
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              })
            // TODO: Save and load UI :(
          )
        );

      const modal = new Modal(modalContent);
      modal.show();
    });

  const requestUi_wrapper = new Html()
    .classOn("column")
    .appendTo(settingsContainer);

  const requestUi_text = new Html("span")
    .text("Please wait..")
    .appendTo(requestUi_wrapper);
  const requestUi_meter = new Html("div")
    .classOn("meter")
    .attr({ value: 0, max: 100 })
    .append(new Html().style({ width: "0%" }))
    .appendTo(requestUi_wrapper);
  const requestUi_hint = new Html("span")
    .classOn("small-text")
    .text("..")
    .appendTo(requestUi_wrapper);

  const versionData = await this.fetch("/api/version").then((j) => j.json());

  const changelogLink = new Html("a")
    .text(`View Changelog for ${versionData.version}`)
    .on("click", (e) => {
      let mc = new Html().html(versionData.changelog);
      let m = new Modal(mc);
      m.show();
    });
  const debugVersionNumber = new Html("span")
    .classOn("small-label")
    .style({ "margin-top": "auto" })
    .html(versionData.footerNote)
    .append(changelogLink)
    .appendTo(settingsContainer);

  function updaterequestsMessage() {
    if (apiUsage.remaining !== null) {
      requestUi_text.text(
        `${apiUsage.used} of ${apiUsage.total} requests used (${apiUsage.plan}).`
      );
      requestUi_meter.attr({
        value: apiUsage.used,
        max: apiUsage.total,
      });
      requestUi_meter.query("div").style.width =
        (apiUsage.used / apiUsage.total) * 100 + "%";
      requestUi_meter.classOff("extra-hidden");
      requestUi_hint.text(
        `Your quota resets in ${futureDate(new Date(apiUsage.expires))}.`
      );
    } else {
      requestUi_text.text(
        `0 of ${apiUsage.total} requests used (${apiUsage.plan}).`
      );
      requestUi_meter.classOn("extra-hidden");
      requestUi_hint.text("");
    }
  }

  updaterequestsMessage();

  marked.use({
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartypants: false,
    xhtml: false,
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  function callAiStream(message, callback) {
    const socket = io(`${OPENAI_URL_WS}`);
    let receivedInitMessage = false;
    socket.on("connect", () => {
      select.disabled = true;
      socket.emit("begin", {
        user: userName,
        useUserName: settings_enableUserName.elm.checked,
        prompt: message,
        botPrompt: select.elm.value,
        customSettings: {
          temp: parseFloat(customSettings_temp.elm.value),
          system: customSettings_systemPrompt.elm.value,
        },
        rememberContext: settings_rememberContextCheckbox.elm.checked,
        context: messageHistory
          .filter((m) => m !== null)
          .slice(0, messageHistory.length - 1),
      });
    });
    socket.on("recv", (event) => {
      receivedInitMessage = true;
      callback({ msg: event.data.replace(/\\n/g, "\n") });
    });
    socket.on("err", (event) => {
      callback({
        unfilteredMsg:
          "<div id='AI_TEMP_ERR' class='error'>Something went wrong: " +
          event.errorMessage +
          "</div>",
      });
      const div = document.getElementById("AI_TEMP_ERR");
      div.id = "";
      return callback(true);
    });
    socket.on("done", () => {
      socket.close();
      callback(true);
    });
    let onErr = async (e) => {
      console.log("[ERR]", e);
      socket.close();
      if (receivedInitMessage === false) {
        receivedInitMessage = true; // idk this may prevent it from calling again
        callback({
          unfilteredMsg:
            "<div id='AI_TEMP_ERR' class='error'>Something went wrong, give me a moment..</div>",
        });
        const div = AI_TEMP_ERR;
        div.id = "";
        const result = await fetch("/api/usage")
          .then((j) => j.json())
          .catch((e) => {
            console.log("oops??", e);
          });
        try {
          if (result !== undefined) {
            div.innerHTML =
              result.remaining === 0
                ? "It looks like you ran out of available API requests.<br>Please try again in " +
                  futureDate(new Date(result.expires)) +
                  ", or ask Kat for more lol"
                : "Something went wrong: An unknown error occured.";
          } else {
            div.textContent +=
              " Also, It looks like you lost connection. Would you care to refresh?";
          }
        } catch (e) {
          div.textContent +=
            " Also, It looks like you lost connection. Would you care to refresh?";
        }
        callback(true);
      }
      select.disabled = false;
    };
    socket.on("disconnect", onErr);
    socket.on("error", onErr);
    socket.on("err", onErr);
  }

  function futureDate(fd) {
    const now = new Date();
    const diff = fd - now;

    let timeString = "";
    if (diff <= 0) {
      timeString = "now";
    } else if (diff < 1000 * 60) {
      timeString = `${Math.floor(diff / 1000)} seconds`;
    } else if (diff < 1000 * 60 * 60) {
      timeString = `${Math.floor(diff / (1000 * 60))} minutes`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      timeString = `${Math.floor(diff / (1000 * 60 * 60))} hours`;
    } else if (diff < 1000 * 60 * 60 * 24 * 7) {
      timeString = `${Math.floor(diff / (1000 * 60 * 60 * 24))} days`;
    } else {
      timeString = fd.toDateString();
    }

    return timeString;
  }

  async function callAiMessage(ai, message) {
    return new Promise((res, rej) => {
      let result = "";
      ai.querySelector(".data .text").innerHTML = "";
      ai.classList.add("thinking");
      let messages = [];
      callAiStream(message, (r) => {
        if (r === true) {
          ai.classList.remove("thinking");
          window.messages = messages;
          window.dispatchEvent(
            new CustomEvent("chatify-message-complete", {
              detail: { data: result },
            })
          );
          return res(result);
        }
        if (r === false) {
          // temp. clear
          ai.querySelector(".data .text").innerHTML = "";
        }
        if (r.unfilteredMsg) {
          result += r.unfilteredMsg;
          ai.querySelector(".data .text").innerHTML = result;
          return;
        }
        if (!r.msg) return console.log("?!");
        result += r.msg;
        ai.querySelector(".data .text").innerHTML = DOMPurify.sanitize(
          marked.parse(result)
        );
        scrollDown();

        window.sourceMessage = result;
        window.previousMessage = r;
        window.finalHtml = ai.querySelector(".data .text").innerHTML;
      });
    });
  }

  function makeMessage(side = 0, data, messageIndex, prompt = null) {
    if (messageIndex === undefined) messageIndex = messageHistory.length;
    const msg = new Html().class("message");
    const icon = new Html().class("icon").appendTo(msg);
    const dataContainer = new Html()
      .class("data")
      .classOn("fg-max")
      .appendTo(msg);
    const extra = new Html().class("center-row").appendTo(msg);
    const uname = new Html().class("name").appendTo(dataContainer);
    const text = new Html().class("text").appendTo(dataContainer);
    switch (side) {
      case 0:
        msg.class("user");
        dataContainer.class("muted");
        text.html(data);
        if (prompt) {
          uname.text(prompt);
        } else {
          uname.text(userName);
        }
        break;
      case 1:
        msg.class("gpt");
        msg.elm.dataset.mode = select.elm.value;
        uname.text(
          select.elm.querySelector(
            'select option[value="' + select.elm.value + '"]'
          ).value
        );
        if (prompt !== null) {
          if (prompt.avatar !== null && prompt.avatar !== undefined) {
            msg.style({ "--icon": "url(" + prompt.avatar + ")" });
          } else {
            msg.style({ "--icon": "url(./assets/avatars/builtin/custom.svg)" });
          }
          if (prompt.displayName !== null && prompt.displayName !== undefined) {
            uname.text(prompt.displayName);
          }
        }
        if (select.elm.value === "custom") {
          if (aiAvatarOverride !== false) {
            icon.style({ "background-image": "url(" + aiAvatarOverride + ")" });
          }
          if (aiNameOverride !== false) {
            uname.text(aiNameOverride);
          }
        }
        break;
    }
    extra.append(
      new Html("button")
        .class("transparent")
        .html(ICONS.trashCan)
        .on("click", (e) => {
          let modal;
          const modalContainer = new Html()
            .text("Are you sure you want to delete this message?")
            .append(
              new Html()
                .classOn("fg-auto")
                .classOn("row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", (e) => {
                      messageHistory[messageIndex] = null;
                      window.mh = messageHistory;
                      msg.cleanup();
                      modal.hide();
                    })
                )
                .append(
                  new Html("button")
                    .text("Cancel")
                    .classOn("danger")
                    .classOn("fg-auto")
                    .on("click", (e) => {
                      modal.hide();
                    })
                )
            );

          modal = new Modal(modalContainer);
          modal.show();
        })
    );
    msg.appendTo(messagesContainer);
    window.mh = messageHistory;
    scrollDown();
    return msg;
  }

  function makeMsgSeparator(content = "The conversation continues...") {
    new Html()
      .append(new Html("span").classOn("text").text(content))
      .classOn("separator")
      .appendTo(messagesContainer);
    scrollDown();
  }

  function updateMessage(messageRef, data = null) {
    messageRef.querySelector(".data").classList.remove("muted", "dots-flow");

    if (data !== null) {
      if (data.startsWith('"')) data = data.slice(1);
      if (data.endsWith('"')) data = data.slice(0, -1);
      messageRef.querySelector(".data .text").innerHTML = DOMPurify.sanitize(
        marked.parse(data)
      );
    }
  }

  this.window.addEventListener("chatify-message-request", async (e) => {
    if (e.detail.history && e.detail.history === "remove") {
      messageHistory = [];
    }
    await request(e.detail.data, false);
  });

  async function request(text, addUserMessage = true) {
    message = text;

    const i = inputArea.elm;

    const userIndex =
      messageHistory.push({
        role: "user",
        content: text,
        name: usernameInput.elm.value,
      }) - 1;

    const aiIndex =
      messageHistory.push({
        role: "assistant",
        type: select.elm.value,
        content: "Thinking...",
      }) - 1;

    const prompt = prompts.find((p) => p.id === select.elm.value) || prompts[0];

    let human;
    if (addUserMessage === true) {
      human = makeMessage(0, DOMPurify.sanitize(marked.parse(text)), userIndex);
    }
    let ai = makeMessage(1, "", aiIndex, prompt);

    i.disabled = true;
    deleteConvoButton.elm.disabled = true;

    if (prompt.id === "community--clock") {
      text =
        `My current timezone is ${
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }. ` + text;
    }

    let result = await callAiMessage(
      ai.elm,
      text,
      messageHistory.slice(0, messageHistory.length - 1)
    );
    updateMessage(human.elm);
    messageHistory[aiIndex].content = result;

    i.placeholder = "Preparing..";

    i.placeholder = "Message";

    i.disabled = false;
    deleteConvoButton.elm.disabled = false;

    await checkRequests();
    updaterequestsMessage();
  }

  function scrollDown() {
    var chatWindow = messagesContainer.elm;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  inputArea.elm.addEventListener("keydown", (e) => {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      if (e.target.value) {
        request(e.target.value);
        e.target.value = "";
        scrollDown();
      }
    }
    var currentRows = e.target.value.split("\n").length;
    if (keyCode === 13 && e.shiftKey) {
      currentRows++;
    }
    if (currentRows <= 5) {
      e.target.rows = currentRows;
    } else {
      e.target.rows = 5;
    }
  });
});
