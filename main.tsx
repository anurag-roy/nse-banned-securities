/** @jsx h */
import { serve } from 'https://deno.land/std@0.155.0/http/server.ts';
import { h, html } from 'https://deno.land/x/htm@0.0.10/mod.tsx';
import { UnoCSS } from 'https://deno.land/x/htm@0.0.10/plugins.ts';

// enable UnoCSS
html.use(UnoCSS());

const getData = async (dateInIST: Date) => {
  const dateParam = dateInIST
    .toISOString()
    .slice(0, 10)
    .split('-')
    .reverse()
    .join('');
  const res = await fetch(
    `https://www1.nseindia.com/archives/fo/sec_ban/fo_secban_${dateParam}.csv`
  );
  if (res.ok) {
    const csv = await res.text();
    return csv.split('\n').map((row) => {
      const [id, name] = row.split(',');
      return {
        id,
        name,
      };
    });
  } else {
    return [];
  }
};

const handler = async (req: Request) => {
  const dateInIST = new Date(Date.now() + 5.5 * 3600000);
  const data = await getData(dateInIST);
  data.shift();

  const heading = `NSE Securities banned for trade on ${dateInIST.toLocaleDateString(
    'en-IN'
  )}`;

  return html({
    title: heading,
    body: (
      <body class="p-8">
        <header>
          <h1 class="text-center font-bold font-3xl">{heading}</h1>
        </header>
        <main class="max-w-md mx-auto overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mt-8">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="pl-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Id
                </th>
                <th
                  scope="col"
                  class="pl-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Name
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {data.length ? (
                data.map(
                  (d) =>
                    d?.id && (
                      <tr key={d.id}>
                        <td class="whitespace-nowrap py-4 pl-6 text-sm font-medium text-gray-900">
                          {d.id}
                        </td>
                        <td class="whitespace-nowrap py-4 pl-4 text-sm font-medium text-gray-900">
                          {d.name}
                        </td>
                      </tr>
                    )
                )
              ) : (
                <tr>
                  <td></td>
                  <td class="whitespace-nowrap py-4 pl-6 text-sm font-medium text-gray-900">
                    No data to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
        <footer class="mt-8 text-center">
          <a
            href="https://github.com/anurag-roy/nse-banned-securities"
            class="text-blue-600"
          >
            View source
          </a>
        </footer>
      </body>
    ),
  });
};

serve(handler);
