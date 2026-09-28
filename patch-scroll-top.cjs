const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Patch the "Своя услуга" button
const customServiceSearch = `onClick={() =>
                      setManualService((prev) => ({
                        ...prev,
                        name: !prev.active && procSearch.trim() ? procSearch.trim() : prev.name,
                        active: !prev.active,
                      }))
                    }`;
const customServiceReplace = `onClick={(e) => {
                      setManualService((prev) => ({
                        ...prev,
                        name: !prev.active && procSearch.trim() ? procSearch.trim() : prev.name,
                        active: !prev.active,
                      }));
                      const container = e.target.closest('[class*="overflow-y-auto"]');
                      const block = e.target.closest('.rounded-2xl');
                      if (container && block) {
                        const targetTop = block.offsetTop;
                        [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - 20; }, t));
                      }
                    }}`;
code = code.split(customServiceSearch).join(customServiceReplace);


// 2. Patch "Название" input in custom service (around manualNameRef)
const nameSearch = `ref={manualNameRef}
                      placeholder="Название"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                      value={manualService.name}
                      onChange={(e) =>
                        setManualService((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }`;
const nameReplace = `ref={manualNameRef}
                      placeholder="Название"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                      value={manualService.name}
                      onChange={(e) =>
                        setManualService((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      onFocus={(e) => {
                        const container = e.target.closest('[class*="overflow-y-auto"]');
                        const block = e.target.closest('.rounded-2xl');
                        if (container && block) {
                          const targetTop = block.offsetTop;
                          [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - 20; }, t));
                        }
                      }}
                      onClick={(e) => {
                        const container = e.target.closest('[class*="overflow-y-auto"]');
                        const block = e.target.closest('.rounded-2xl');
                        if (container && block) {
                          const targetTop = block.offsetTop;
                          [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - 20; }, t));
                        }
                      }}`;
code = code.split(nameSearch).join(nameReplace);


// 3. Patch "Поиск в прайсе..." input
const priceSearchSearch = `onFocus={(e) => {
                        const el = e.target.closest('[class*="overflow-y-auto"]');
                        if (el) {
                          const targetTop = e.target.offsetTop;
                          [100, 300, 500].forEach((t) =>
                            setTimeout(() => {
                              el.scrollTop = targetTop - 60;
                            }, t)
                          );
                        }
                      }}`;
const priceSearchReplace = `onFocus={(e) => {
                        const container = e.target.closest('[class*="overflow-y-auto"]');
                        const block = e.target.closest('.rounded-2xl');
                        if (container && block) {
                          const targetTop = block.offsetTop;
                          [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - 20; }, t));
                        }
                      }}
                      onClick={(e) => {
                        const container = e.target.closest('[class*="overflow-y-auto"]');
                        const block = e.target.closest('.rounded-2xl');
                        if (container && block) {
                          const targetTop = block.offsetTop;
                          [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - 20; }, t));
                        }
                      }}`;
code = code.split(priceSearchSearch).join(priceSearchReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched fields.");
