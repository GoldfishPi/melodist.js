/*
 *
 */
(function() {
    const FnController = controller => {

        const el = observable(null); 
        const active = observable(false);

        const tag = observable('div');
        const sub_controllers = observable([]);
        const events = observable([]);
        const elements = observable([]);
        const setup_fn = observable(() => {});
        const controller_html = observable('');
        const bound_data = observable({});

        const sub = (tag, controller) => {
            sub_controllers([
                ...sub_controllers(),
                { tag, controller }
            ])
        }

        const event = (tag, cb) => events([
            ...events(),
            { tag, cb }
        ])

        const element = (tag) => {
            const element = observable(null)
            elements([
                ...elements(),
                { 
                    tag,
                    element
                }
            ])
            return element;
        }

        const data = (bindings) => bound_data(bindings);

        const setup = (fn) => setup_fn(fn);        

        const release = () => {

            events().forEach(({ tag, cb }) => {
				const match = tag.match(/^(\w+)\s*(.*)$/);
				const evname = match[1].trim();
				const selector = match[2].trim();
                Composer.remove_event(el(), evname, cb, selector);
            });

            sub_controllers().forEach(({ controller }) => {
                controller.release();
            });

            el().parentNode.removeChild(el());
        }

        const controller_options = observable({ 
            sub, 
            event, 
            element, 
            el, 
            setup,
            release,
            data,
        });


        const init = () => {
            controller_html(
                controller(controller_options())
            );
            const created = document.createElement(tag())
            el(created);
            setup_fn();
        }

        const render = () => {
            const html = observable(controller_html());
            for(const key in bound_data()) {
                const new_html = html().replace(/{.*}/, bound_data()[key]());
                html(new_html);
            }
            el().innerHTML = html();
            append_subcontrollers();
        }

        const bind = () => {
            events().forEach(({ tag, cb }) => {
				const match = tag.match(/^(\w+)\s*(.*)$/);
				const evname = match[1].trim();
				const selector = match[2].trim();
                Composer.add_event(el(), evname, cb, selector);
            })

            elements().forEach(({ tag, element }) => {
                element(Composer.find(el(), tag));
            });

            for(let key in bound_data()) {
                bound_data()[key].subscribe(() => render());
            }
        }

        const append_subcontrollers = () => {
            sub_controllers().forEach(({ tag, controller }) => {
                if(controller.active()) {
                    el().querySelector(tag)
                        .appendChild(controller.el());
                } else {
                    el().querySelector(tag)
                        .appendChild(controller.inject());
                }
            })
        }

        const inject = (inject_tag) => {
            init();
            render();
            bind();
            const element = Composer.find(document, inject_tag);
            if(element) element.appendChild(el());
            active(true);
            return el();
        }

        return (options) => {

            controller_options({
                ...controller_options(),
                ...options
            });

            return {
                el,
                inject,
                release,
                active,
            }
        };
    }
    Composer.exp0rt({ FnController })
}).apply((typeof exports != 'undefined') ? exports : this);
