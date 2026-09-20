"use strict";

CrossPoint.registerPlugin(async (container, api) => {
    const CONFIG_PATH = "/.crosspoint/plugins/bookorbit-page-sync/config.json";
    let storedPassword = "";

    function makeField(labelText, name, type) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("setting-row");
        // Label
        const label = document.createElement("span");
        label.classList.add("setting-name");
        label.textContent = labelText;
        // Actual input
        const inputWrapper = document.createElement("span");
        inputWrapper.classList.add("setting-control");
        const input = document.createElement("input");
        input.name = name;
        input.type = type || "text";
        input.autocomplete = name === "password" ? "new-password" : "off";
        // Add them together
        inputWrapper.appendChild(input);
        wrapper.appendChild(label);
        wrapper.appendChild(inputWrapper);
        container.appendChild(wrapper);
        return input;
    }

    function currentConfig() {
        const apiBase = apiBaseInput.value.trim();
        if (!apiBase) {
            stat.textContent = "Enter a valid HTTP(S) API URL.";
            return null;
        }
        const deviceId = deviceIdInput.value.trim();
        if (!/^[A-Za-z0-9-]{1,100}$/.test(deviceId)) {
            stat.textContent = "Device ID must use 1–100 letters, numbers, or hyphens.";
            return null;
        }
        const username = usernameInput.value.trim();
        if (!username) {
            stat.textContent = "Enter your KOReader sync username.";
            return null;
        }
        const password = passwordInput.value || storedPassword;
        if (!password) {
            stat.textContent = "Enter your KOReader sync password.";
            return null;
        }
        return { apiBase, username, password, deviceId };
    }

    async function loadConfig() {
        try {
            const r = await fetch('/download?path=' + encodeURIComponent(CONFIG_PATH));
            if (!r.ok) return null;
            return JSON.parse(await r.text());
        } catch (e) {
          return null;
        }
    }

    // Top part
    const heading = document.createElement("h2");
    heading.textContent = "BookOrbit Page Stats";
    const help = document.createElement("p");
    help.textContent = "Send reading sessions to your BookOrbit sync server via the KOReader sync endpoint. Configure credentials in BookOrbit in the KOReader settings and copy the KOReader sync URL, the username, and the password here. The device ID is used to differentiate between different readers.";
    container.appendChild(heading);
    container.appendChild(help);

    // Actual fields
    const apiBaseInput = makeField("BookOrbit base URL", "apiBase", "text");
    const usernameInput = makeField("KOReader sync username", "username", "text");
    const passwordInput = makeField("KOReader sync password", "password", "password");
    const deviceIdInput = makeField("Device ID", "deviceId", "text");

    // Lower part
    const actions = document.createElement("div");
    actions.style.marginTop = "1em";
    const saveButton = document.createElement("button");
    saveButton.classList.add("btn-small");
    saveButton.classList.add("btn-add");
    saveButton.textContent = "Save";
    const testButton = document.createElement("button");
    testButton.classList.add("btn-small");
    testButton.textContent = "Test connection";
    testButton.style.marginLeft = "0.5em";
    const stat = document.createElement("p");
    stat.setAttribute("role", "status");
    actions.appendChild(saveButton);
    actions.appendChild(testButton);
    container.appendChild(actions);
    container.appendChild(stat);

    // Event handlers
    saveButton.addEventListener("click", async () => {
        const config = currentConfig();
        if (!config) return;
        saveButton.disabled = true;
        stat.textContent = "Saving configuration…";
        try {
            await api.writeFile(CONFIG_PATH, btoa(JSON.stringify(config)));
            storedPassword = config.password;
            passwordInput.value = "";
            passwordInput.placeholder = "(unchanged)";
            stat.textContent = "Configuration saved.";
        } catch (_error) {
            stat.textContent = "Unable to save configuration.";
        } finally {
            saveButton.disabled = false;
        }
    });

    testButton.addEventListener("click", async () => {
      const config = currentConfig();
      if (!config) return;
      testButton.disabled = true;
      stat.textContent = "Testing connection…";
      try {
          const response = await api.relay("POST", `${config.apiBase}/plugin/page-stats`,
              { "x-auth-user": config.username, "x-auth-key": config.password, "content-type": "application/json" },
              JSON.stringify({
                  "deviceId": config.deviceId,
                  "deviceModel": "CrossPoint",
                  "pluginVersion": "1.0.0",
                  "books": [
                      {
                          "hash": "a10439b13d689f0a856e998478b91098", // dummybookfortest
                          "events": [
                              {
                                  "page": 0,
                                  "startTime": 1,
                                  "durationSeconds": 0,
                                  "totalPages": 1
                              }
                          ]
                      }
                  ]
              })
          );
          if (response && Number(response.status) >= 200 && Number(response.status) < 300) {
              stat.textContent = "Connection successful.";
          } else {
              stat.textContent = `Connection failed: ${response.body}`;
          }
      } catch (err) {
          stat.textContent = `Connection failed: ${err}`;
      } finally {
          testButton.disabled = false;
      }
    });

    // Load existing data
    const existing = await loadConfig();
    if (existing) {
        apiBaseInput.value = existing.apiBase || "";
        usernameInput.value = existing.username || "";
        if (existing.password) {
            storedPassword = existing.password;
            passwordInput.placeholder = "(unchanged)";
        }
        if (existing.deviceId) {
            deviceIdInput.value = existing.deviceId;
        } else {
            const bytes = new Uint8Array(4);
            crypto.getRandomValues(bytes);
            let suffix = "";
            for (const byte of bytes) suffix += byte.toString(16).padStart(2, "0");
            deviceIdInput.value = `CrossPoint-${suffix}`
        }
    }
});
