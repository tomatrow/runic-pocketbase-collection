function srcenv --argument-names env_file
	cat $env_file | grep -vE '^(#|\s*$)' | while read line
		set item (string split -m 1 '=' $line)
		set --export --global $item[1] $item[2]
	end
end

function tmux_triple_pane
	argparse 'left=' 'right=' 'center=' 'preamble=?' -- $argv
	or return

	tmux new-session \; \
		send-keys "$_flag_preamble; $_flag_left" C-m \; \
		split-window -v \; \
		send-keys "$_flag_preamble; $_flag_center" C-m \; \
		select-pane -t 0 \; \
		split-window -h \; \
		send-keys "$_flag_preamble; $_flag_right" C-m \;
end
