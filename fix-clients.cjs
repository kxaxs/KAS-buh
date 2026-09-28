const fs = require('fs');
let code = fs.readFileSync('src/screens/ClientsScreen.tsx', 'utf8');

code = code.replace('<div className="space-y-[2px]">\n              {filteredClients.length === 0', '{filteredClients.length === 0');
code = code.replace('<div className="space-y-2">', '<div className="space-y-[2px]">');
code = code.replace('              )}\\n            </div>\\n\\n    </>\\n  );\\n}', '              )}\\n            </div>\\n\\n    </>\\n  );\\n}');

const exactEndingOld = `              )}
            </div>
            </div>

    </>
  );
}`;

const exactEndingNew = `              )}
            </div>

    </>
  );
}`;

if (code.includes(exactEndingOld)) {
    code = code.replace(exactEndingOld, exactEndingNew);
} else {
    // If not matching, just try replacing `</div>\n            </div>\n\n    </>`
    const altEndingOld = `</div>\n            </div>\n\n    </>`;
    const altEndingNew = `</div>\n\n    </>`;
    code = code.replace(altEndingOld, altEndingNew);
}

fs.writeFileSync('src/screens/ClientsScreen.tsx', code);
console.log('Fixed ClientsScreen.tsx');
