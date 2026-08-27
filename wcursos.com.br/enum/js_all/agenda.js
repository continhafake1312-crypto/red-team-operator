var CalendarListView= {
    init:function() {
        $("#m_calendar").fullCalendar( {
            header: {
                left: "prev,next today", center: "title", right: "agendatext,month,agendaWeek,agendaDay,listatext,listMonth,listWeek,listDay"
            },
            defaultView:"listWeek", 
            editable:false, 
            eventLimit:false, 
            navLinks:false, 
            allDaySlot : false,
            selectable: false,
            selectHelper: false,
            firstHour: 8,
            height: 'auto', 
            width: 'auto',
            views: {
                week: {
                    titleFormat: '[De] D MMMM YYYY',
                    titleRangeSeparator: ' Até ',
                }
            },   
            buttonText: {
                listMonth: "Mês",
                listWeek: "Semana",
                listDay: "Dia"
            },
            customButtons: {
                listatext: {text: 'Lista:'},
                agendatext: {text: 'Agenda:'}
              },
            eventRender: function(eventObj, $el) {
                $el.popover({
                  title: eventObj.title,
                  content: eventObj.description,
                  trigger: 'hover',
                  placement: 'top',
                  html: true,
                  container: 'body'
                });
                
                $el.css('cursor', 'pointer');
              },
        
            events: '/portal/getAgenda',
            eventClick: function(eventObj) {
				if (eventObj.url != null && eventObj.url != '') {
					window.open(eventObj.url, '_self');
				}
            }
        })
    }
}

jQuery(document).ready(function() {
    CalendarListView.init()
});
