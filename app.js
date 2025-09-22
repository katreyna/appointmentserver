const http = require('http');
const url = require('url');

const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"],
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
};
const appointments = [
    {name: "James", day: "Wednesday", time: "3:30" },
    {name: "Lillie", day: "Friday", time: "1:00" }];

let serverObj =  http.createServer(function(req,res){
	console.log(req.url);
	let urlObj = url.parse(req.url,true);
	switch (urlObj.pathname) {
		case "/schedule":
			schedule(urlObj.query,res);
			break;
		case "/cancel":
			cancel(urlObj.query,res);
			break;
		case "/check":
			check(urlObj.query,res);
			break;
		default:
			error(res,404,"pathname unknown");

	}
});

// helper

function sendRes(res, status, message) {
	res.writeHead(200,{'content-type':'text/plain'});
        res.write(message);
        res.end();
}

function check(qObj, res) {
	
	//check if day is valid
	
	if (!availableTimes[qObj.day]) {
                error(res, 400, "Invalid Day");
		return;

	// check if timeslot is valid

	if (availableTimes[qObj.day].some(time => time === qObj.time)) {
		sendRes(res, 200, "Timeslot is available!");
	} else {
		sendRes(res, 200, "Timeslot is not available!");
	}
}

function schedule(qObj,res) {
	if (availableTimes[qObj.day].some(time => time == qObj.time))
	{
		// remove time
		availableTimes[qObj.day] = availableTimes[qObj.day].filter(time => time!= qObj.time);

		// add new appointment

		appointments.push({
			name: qObj.name,
			day: qObj.day,
			time: qObj.time
		});

		sendRes(res, 200, "scheduled!");
	}
	else
		error(res,400,"Can't schedule, appointment time not available");


}

function cancel(qObj, res) {

	// find index of array

	const appointmentIndex = appointments.findIndex(appt => 
		appt.name === qObj.name &&
		appt.day === qObj.day &&
		appt.time == qObj.time
	);

	// remove  and add back appt

        if (appointmentIndex !== -1)
        {
		// remove 
		const removedAppointment = appointments.splice(appointmentIndex,1);	

		// adding back

		if (availableTimes[qObj.day]) {
			availableTimes[qObj.day].push(qObj.time);
			availableTimes[qObj.day].sort();
		}

		sendRes(res, 200, "Appointment Cancelled");
	
	} else {
		error(res, 404, "Appointment Not Found");
	}
}

function error(res, status, message) {
	
	sendRes(res, status, message);

}

serverObj.listen(80,function(){console.log("listening on port 80")});
